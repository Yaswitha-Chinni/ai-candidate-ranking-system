import yaml
import logging
import os

logger = logging.getLogger(__name__)

class ScoringEngine:
    def __init__(self, config_path: str = "config.yaml"):
        self.weights = {
            "semantic_similarity": 0.40,
            "skill_match": 0.20,
            "experience_match": 0.15,
            "education_match": 0.10,
            "projects_match": 0.10,
            "behavioral_match": 0.05
        }
        self._load_config(config_path)

    def _load_config(self, config_path: str):
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = yaml.safe_load(f)
                    if config and 'weights' in config:
                        self.weights.update(config['weights'])
                logger.info("Loaded custom weights from config.yaml")
        except Exception as e:
            logger.error(f"Error loading config: {e}. Using default weights.")

    def calculate_score(self, candidate: dict, jd_requirements: dict, semantic_score: float) -> dict:
        """
        Calculates the hybrid score based on semantic similarity and exact matches.
        semantic_score is a value between 0 and 1, typically derived from cosine similarity.
        """
        # Skill match (intersection over union or simple percentage)
        req_skills = set([s.lower() for s in jd_requirements.get('skills', [])])
        cand_skills = set([s.lower() for s in candidate.get('skills', [])])
        
        if req_skills:
            skill_score = len(req_skills.intersection(cand_skills)) / len(req_skills)
        else:
            skill_score = 1.0 # If no skills required, give full points

        # Experience match
        req_exp = jd_requirements.get('experience_years', 0)
        cand_exp = candidate.get('years_of_experience', 0)
        exp_score = min(cand_exp / req_exp, 1.0) if req_exp > 0 else 1.0
        
        # Education and projects match - simplified for MVP
        edu_score = 1.0 if candidate.get('education_degrees') else 0.5
        projects_score = 0.5 # Default placeholder if project extraction is complex
        
        # Behavioral score (from redrob_signals)
        signals = candidate.get('redrob_signals', {})
        profile_completeness = signals.get('profile_completeness_score', 50) / 100.0
        behavioral_score = profile_completeness

        # Normalize weights so they sum to 1.0
        total_weight = sum(self.weights.values())
        if total_weight == 0:
            total_weight = 1.0 # fallback to prevent division by zero
            
        norm_weights = {k: v / total_weight for k, v in self.weights.items()}

        total_score = (
            semantic_score * norm_weights.get('semantic_similarity', 0.4) +
            skill_score * norm_weights.get('skill_match', 0.2) +
            exp_score * norm_weights.get('experience_match', 0.15) +
            edu_score * norm_weights.get('education_match', 0.1) +
            projects_score * norm_weights.get('projects_match', 0.1) +
            behavioral_score * norm_weights.get('behavioral_match', 0.05)
        )
        
        # Ensure total score is capped at 1.0
        total_score = min(max(total_score, 0.0), 1.0)
        
        return {
            "semantic_score": semantic_score,
            "skill_score": skill_score,
            "experience_score": exp_score,
            "education_score": edu_score,
            "projects_score": projects_score,
            "behavioral_score": behavioral_score,
            "total_score": total_score
        }
