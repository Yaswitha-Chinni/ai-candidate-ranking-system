import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import logging

logger = logging.getLogger(__name__)

def export_to_csv(data: list[dict], filepath: str):
    try:
        # Flatten the score breakdown
        flat_data = []
        for row in data:
            flat_row = {
                "candidate_id": row.get("candidate_id"),
                "name": row.get("name"),
                "matched_skills": ", ".join(row.get("matched_skills", [])),
                "missing_skills": ", ".join(row.get("missing_skills", [])),
                "gemini_explanation": row.get("gemini_explanation")
            }
            breakdown = row.get("score_breakdown", {})
            for k, v in breakdown.items():
                flat_row[k] = v
            flat_data.append(flat_row)
            
        df = pd.DataFrame(flat_data)
        df.to_csv(filepath, index=False)
        logger.info(f"Successfully exported CSV to {filepath}")
    except Exception as e:
        logger.error(f"Error exporting to CSV: {e}")
        raise

def export_to_pdf(data: list[dict], filepath: str):
    try:
        c = canvas.Canvas(filepath, pagesize=letter)
        width, height = letter
        
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "Recruiter Candidate Report")
        
        c.setFont("Helvetica", 10)
        y = height - 80
        
        for idx, row in enumerate(data):
            if y < 100:
                c.showPage()
                y = height - 50
                
            score = round(row['score_breakdown']['total_score'] * 100, 2)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, f"{idx+1}. {row['name']} - Score: {score}%")
            y -= 15
            
            c.setFont("Helvetica", 10)
            c.drawString(60, y, f"Candidate ID: {row['candidate_id']}")
            y -= 15
            c.drawString(60, y, f"Matched Skills: {', '.join(row['matched_skills'])}")
            y -= 15
            
            # Simple text wrapping for explanation
            explanation = row['gemini_explanation']
            import textwrap
            wrapped = textwrap.wrap(explanation, width=90)
            for line in wrapped:
                c.drawString(60, y, line)
                y -= 15
                
            y -= 20 # Add space between candidates
            
        c.save()
        logger.info(f"Successfully exported PDF to {filepath}")
    except Exception as e:
        logger.error(f"Error exporting to PDF: {e}")
        raise
