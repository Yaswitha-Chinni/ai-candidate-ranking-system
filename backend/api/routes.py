import os
import json
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks

from schemas.models import (
    JobDescriptionUploadResponse,
    CandidateUploadResponse,
    RankRequest,
    RankResponse,
    WeightConfig,
    CandidateResult,
    CandidateScoreBreakdown
)
from services.document_parser import parse_document
from services.llm_service import LLMService
from services.data_processor import load_candidates, preprocess_candidate
from services.embedding_service import EmbeddingService
from services.vector_db_service import VectorDBService
from services.scoring_engine import ScoringEngine
from services.export_service import export_to_csv, export_to_pdf
from services.db_service import db_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize Singletons (In a real app, use dependency injection)
llm_service = LLMService()
embedding_service = EmbeddingService()
vector_db = VectorDBService()
scoring_engine = ScoringEngine()

# In-memory storage for MVP (use Redis/DB in prod)
session_store = {
    "jobs": {},
    "candidates": {},
    "rankings": {}
}

@router.post("/jobs/upload", response_model=JobDescriptionUploadResponse)
async def upload_job(file: Optional[UploadFile] = File(None), text: Optional[str] = Form(None)):
    jd_text = text
    if file:
        content = await file.read()
        try:
            jd_text = parse_document(content, file.filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse document: {e}")
    
    if not jd_text:
        raise HTTPException(status_code=400, detail="Must provide either text or file.")

    logger.info("Analyzing JD with LLM...")
    jd_requirements = llm_service.analyze_jd(jd_text)
    
    # Generate JD embedding based on summary/requirements
    embed_text = jd_requirements.get('summary', jd_text)
    jd_embedding = embedding_service.generate_embedding(embed_text)
    
    job_id = str(uuid.uuid4())
    session_store["jobs"][job_id] = {
        "text": jd_text,
        "requirements": jd_requirements,
        "embedding": jd_embedding
    }
    
    return JobDescriptionUploadResponse(
        status="success",
        job_id=job_id,
        message="Job description processed and requirements extracted successfully."
    )

@router.post("/candidates/upload", response_model=CandidateUploadResponse)
async def upload_candidates(file: UploadFile = File(...)):
    if not file.filename.endswith(('.json', '.jsonl')):
        raise HTTPException(status_code=400, detail="Only JSON and JSONL files are supported.")
    
    content = await file.read()
    temp_path = f"temp_{uuid.uuid4()}.jsonl"
    with open(temp_path, "wb") as f:
        f.write(content)
        
    try:
        raw_candidates = load_candidates(temp_path)
        processed = []
        for cand in raw_candidates:
            try:
                processed.append(preprocess_candidate(cand))
            except Exception as e:
                logger.warning(f"Skipping invalid candidate: {e}")
                
        # Store globally
        added_count = db_service.add_candidates(processed)
        
        # Batch Generate Embeddings
        logger.info(f"Generating embeddings for {len(processed)} candidates...")
        texts = [c['unified_text'] for c in processed]
        embeddings = embedding_service.generate_embeddings_batch(texts)
        
        ids = [c['candidate_id'] for c in processed]
        metadatas = [{"name": c['name']} for c in processed]
        vector_db.store_embeddings(ids, embeddings, metadatas, texts)
        
        return CandidateUploadResponse(
            status="success",
            batch_id="global",
            total_candidates=len(processed),
            message=f"Candidate dataset processed ({added_count} new) and embeddings cached successfully."
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/database/stats")
async def get_database_stats():
    return db_service.get_stats()

@router.post("/candidates/rank", response_model=RankResponse)
async def rank_candidates(request: RankRequest):
    job = session_store["jobs"].get(request.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    candidates = db_service.get_all_candidates()
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found in database. Please ingest data first.")

    # Update weights in engine
    scoring_engine.weights.update(request.weights.dict())
    
    jd_embedding = job["embedding"]
    jd_reqs = job["requirements"]
    
    logger.info("Retrieving candidates from ChromaDB...")
    # Get top 50 matches initially for re-ranking
    results = vector_db.search(jd_embedding, limit=min(50, len(candidates)))
    
    if not results or not results['ids'] or not results['ids'][0]:
        return RankResponse(job_id=request.job_id, batch_id=request.batch_id, top_candidates=[])
        
    returned_ids = results['ids'][0]
    distances = results['distances'][0]
    
    ranked_results = []
    
    # Map candidate IDs back to full profiles
    cand_dict = {c['candidate_id']: c for c in candidates}
    
    for i, cid in enumerate(returned_ids):
        if cid not in cand_dict: continue
        cand_profile = cand_dict[cid]
        
        # Convert chroma distance (typically L2 or cosine distance) to similarity score 0-1
        # If space is cosine, distance is 1 - cosine_similarity. So similarity = 1 - distance
        semantic_score = max(0.0, 1.0 - distances[i])
        
        score_dict = scoring_engine.calculate_score(cand_profile, jd_reqs, semantic_score)
        
        # Find matched/missing skills
        req_skills = [s.lower() for s in jd_reqs.get('skills', [])]
        cand_skills = [s.lower() for s in cand_profile.get('skills', [])]
        
        matched = [s for s in req_skills if s in cand_skills]
        missing = [s for s in req_skills if s not in cand_skills]
        
        ranked_results.append(CandidateResult(
            candidate_id=cid,
            name=cand_profile['name'],
            score_breakdown=CandidateScoreBreakdown(**score_dict),
            matched_skills=matched,
            missing_skills=missing,
            gemini_explanation="", # Populated below
            raw_profile=cand_profile
        ))
        
    # Sort by total score
    ranked_results.sort(key=lambda x: x.score_breakdown.total_score, reverse=True)
    
    # Keep top 20
    top_candidates = ranked_results[:20]
    
    # Generate explanations for top candidates
    logger.info("Generating Gemini explanations for top candidates...")
    for cand in top_candidates:
        cand_profile = cand_dict[cand.candidate_id]
        cand.gemini_explanation = llm_service.generate_explanation(cand_profile, jd_reqs.get('summary', ''))
        
    # Save to session store for export (using global identifier)
    session_store["rankings"][f"{request.job_id}_global"] = top_candidates

    return RankResponse(
        job_id=request.job_id,
        batch_id="global",
        top_candidates=top_candidates
    )

@router.get("/export/csv")
async def export_csv_route(job_id: str, batch_id: Optional[str] = "global"):
    rankings = session_store["rankings"].get(f"{job_id}_{batch_id}")
    if not rankings:
        raise HTTPException(status_code=404, detail="Ranking results not found")
        
    filepath = f"export_{job_id}.csv"
    export_to_csv([r.dict() for r in rankings], filepath)
    from fastapi.responses import FileResponse
    return FileResponse(filepath, filename="ranked_candidates.csv", media_type="text/csv")

@router.get("/export/pdf")
async def export_pdf_route(job_id: str, batch_id: Optional[str] = "global"):
    rankings = session_store["rankings"].get(f"{job_id}_{batch_id}")
    if not rankings:
        raise HTTPException(status_code=404, detail="Ranking results not found")
        
    filepath = f"export_{job_id}.pdf"
    export_to_pdf([r.dict() for r in rankings], filepath)
    from fastapi.responses import FileResponse
    return FileResponse(filepath, filename="recruiter_report.pdf", media_type="application/pdf")
