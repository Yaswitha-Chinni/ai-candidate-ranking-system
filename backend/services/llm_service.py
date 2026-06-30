import os
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            logger.warning("GEMINI_API_KEY not set. LLM features will be disabled or mocked.")
            self.model = None

    def analyze_jd(self, jd_text: str) -> dict:
        """Uses Gemini to extract structured requirements from a raw JD."""
        if not self.model:
            return {"skills": [], "experience_years": 0, "summary": jd_text}
            
        prompt = f"""
        Analyze the following Job Description and extract key requirements in JSON format:
        {{
            "skills": ["List of core skills"],
            "experience_years": <number of years experience required (float)>,
            "summary": "Brief summary of the role"
        }}
        
        Job Description:
        {jd_text}
        
        Respond ONLY with the JSON object.
        """
        try:
            response = self.model.generate_content(prompt)
            # Assuming the response is clean JSON. In production, we'd add safer parsing.
            import json
            text = response.text.strip()
            if text.startswith("```json"): text = text[7:]
            if text.endswith("```"): text = text[:-3]
            return json.loads(text)
        except Exception as e:
            logger.error(f"Error analyzing JD with Gemini: {e}")
            return {"skills": [], "experience_years": 0, "summary": "Error parsing JD"}
    
    def generate_explanation(self, candidate_profile: dict, jd_summary: str) -> str:
        """Uses Gemini to explain why a candidate is a good match (or not)."""
        if not self.model:
            return "Gemini API key not configured. Explanation unavailable."
            
        prompt = f"""
        Explain why this candidate is a good fit for the job. Keep it under 3 sentences.
        
        Job Summary: {jd_summary}
        
        Candidate Skills: {candidate_profile.get('skills', [])}
        Candidate Experience: {candidate_profile.get('years_of_experience', 0)} years
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating explanation with Gemini: {e}")
            return "Failed to generate explanation."
