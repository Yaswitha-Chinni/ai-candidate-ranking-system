import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def load_candidates(filepath: str) -> List[Dict[str, Any]]:
    """Loads candidates from a JSON or JSONL file."""
    logger.info(f"Loading candidates from {filepath}")
    candidates = []
    try:
        if filepath.endswith('.jsonl'):
            with open(filepath, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        candidates.append(json.loads(line))
        elif filepath.endswith('.json'):
            with open(filepath, 'r', encoding='utf-8') as f:
                candidates = json.load(f)
        else:
            raise ValueError("Unsupported file format. Expected .json or .jsonl")
        logger.info(f"Loaded {len(candidates)} candidates.")
        return candidates
    except Exception as e:
        logger.error(f"Error loading candidates from {filepath}: {e}")
        raise

def preprocess_candidate(candidate: Dict[str, Any]) -> Dict[str, Any]:
    """Preprocesses a single candidate profile."""
    # Clean text fields
    profile = candidate.get('profile', {})
    headline = (profile.get('headline') or "").strip()
    summary = (profile.get('summary') or "").strip()
    
    # Normalize skills
    skills = candidate.get('skills', [])
    skill_names = [s.get('name', '').strip().lower() for s in skills if s.get('name')]
    
    # Extract experience details
    career_history = candidate.get('career_history', [])
    exp_descriptions = [job.get('description', '').strip() for job in career_history if job.get('description')]
    total_months_exp = sum([job.get('duration_months', 0) for job in career_history])
    years_of_experience = total_months_exp / 12.0
    
    # Standardize education
    education = candidate.get('education', [])
    degrees = [edu.get('degree', '').strip() for edu in education if edu.get('degree')]
    
    # Create unified text for embedding
    unified_text = f"Headline: {headline}\nSummary: {summary}\nSkills: {', '.join(skill_names)}\nExperience: {' '.join(exp_descriptions)}\nEducation: {', '.join(degrees)}"
    
    processed = {
        'candidate_id': candidate.get('candidate_id'),
        'name': profile.get('anonymized_name', 'Unknown'),
        'unified_text': unified_text,
        'skills': skill_names,
        'years_of_experience': years_of_experience,
        'education_degrees': degrees,
        'redrob_signals': candidate.get('redrob_signals', {})
    }
    return processed

def process_candidates_file(filepath: str) -> List[Dict[str, Any]]:
    """Main pipeline for processing candidate dataset."""
    raw_candidates = load_candidates(filepath)
    processed_candidates = []
    
    # Remove duplicates
    seen_ids = set()
    for cand in raw_candidates:
        cid = cand.get('candidate_id')
        if cid and cid not in seen_ids:
            seen_ids.add(cid)
            try:
                processed_candidates.append(preprocess_candidate(cand))
            except Exception as e:
                logger.warning(f"Error preprocessing candidate {cid}: {e}")
    
    logger.info(f"Successfully processed {len(processed_candidates)} candidates.")
    return processed_candidates
