from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class JobDescriptionUploadResponse(BaseModel):
    status: str
    job_id: str
    message: str

class CandidateUploadResponse(BaseModel):
    status: str
    batch_id: str
    total_candidates: int
    message: str

class WeightConfig(BaseModel):
    semantic_similarity: float = 40.0
    skill_match: float = 20.0
    experience_match: float = 15.0
    education_match: float = 10.0
    projects_match: float = 10.0
    behavioral_match: float = 5.0

class RankRequest(BaseModel):
    job_id: str
    batch_id: Optional[str] = "global"
    weights: WeightConfig

class CandidateScoreBreakdown(BaseModel):
    semantic_score: float
    skill_score: float
    experience_score: float
    education_score: float
    projects_score: float
    behavioral_score: float
    total_score: float

class CandidateResult(BaseModel):
    candidate_id: str
    name: str
    email: Optional[str] = None
    score_breakdown: CandidateScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    gemini_explanation: Optional[str] = None
    raw_profile: Dict[str, Any] = Field(default_factory=dict)

class RankResponse(BaseModel):
    job_id: str
    batch_id: Optional[str] = "global"
    top_candidates: List[CandidateResult]

class JobDetails(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    experience_years: Optional[float] = None
