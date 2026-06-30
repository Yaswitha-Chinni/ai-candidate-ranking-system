import json
import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self, db_path: str = "./candidates_db.json"):
        self.db_path = db_path
        self.candidates = []
        self.load_db()

    def load_db(self):
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, "r", encoding="utf-8") as f:
                    self.candidates = json.load(f)
                logger.info(f"Loaded {len(self.candidates)} candidates from {self.db_path}")
            except Exception as e:
                logger.error(f"Failed to load candidates DB: {e}")
                self.candidates = []
        else:
            self.candidates = []
            logger.info("No existing candidates DB found. Initializing empty DB.")

    def save_db(self):
        try:
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(self.candidates, f, indent=2)
            logger.info(f"Saved {len(self.candidates)} candidates to {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to save candidates DB: {e}")

    def add_candidates(self, new_candidates: List[Dict[str, Any]]):
        # Prevent duplicates based on candidate_id
        existing_ids = {c.get("candidate_id") for c in self.candidates}
        added_count = 0
        for c in new_candidates:
            cid = c.get("candidate_id")
            if cid and cid not in existing_ids:
                self.candidates.append(c)
                existing_ids.add(cid)
                added_count += 1
        
        if added_count > 0:
            self.save_db()
        return added_count

    def get_candidate(self, candidate_id: str) -> Dict[str, Any]:
        for c in self.candidates:
            if c.get("candidate_id") == candidate_id:
                return c
        return None

    def get_all_candidates(self) -> List[Dict[str, Any]]:
        return self.candidates

    def get_stats(self) -> dict:
        return {
            "total_candidates": len(self.candidates),
            "last_updated": os.path.getmtime(self.db_path) if os.path.exists(self.db_path) else None
        }

db_service = DatabaseService()
