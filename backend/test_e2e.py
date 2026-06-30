import requests
import os
import json
import time

BASE_URL = "http://localhost:8000"

def test_api():
    print("--- Starting End-to-End Test ---")
    
    # Wait for backend to be available
    for i in range(10):
        try:
            res = requests.get(f"{BASE_URL}/docs")
            if res.status_code == 200:
                print("Backend is up!")
                break
        except requests.exceptions.ConnectionError:
            print("Waiting for backend...")
            time.sleep(2)
    else:
        print("Backend did not start in time. Exiting.")
        return

    # 1. Upload JD
    print("\n[1] Uploading Job Description...")
    jd_payload = {"text": "Looking for a Software Engineer with 5 years of Python experience, REST APIs, and AWS."}
    res_jd = requests.post(f"{BASE_URL}/api/jobs/upload", data=jd_payload)
    print("Response Status:", res_jd.status_code)
    try:
        jd_data = res_jd.json()
        job_id = jd_data.get("job_id")
        print(f"Job ID: {job_id}")
    except Exception as e:
        print("Failed to parse JD response:", res_jd.text)
        return

    # 2. Upload Candidates
    print("\n[2] Uploading Candidates...")
    # Create dummy candidates
    cands = [
        {"candidate_id": "C1", "name": "Alice", "skills": ["Python", "AWS", "REST"], "experience_years": 6},
        {"candidate_id": "C2", "name": "Bob", "skills": ["Java", "Spring"], "experience_years": 3}
    ]
    with open("dummy_cands.jsonl", "w") as f:
        for c in cands:
            f.write(json.dumps(c) + "\n")
            
    with open("dummy_cands.jsonl", "rb") as f:
        res_cand = requests.post(f"{BASE_URL}/api/candidates/upload", files={"file": f})
    
    print("Response Status:", res_cand.status_code)
    try:
        cand_data = res_cand.json()
        batch_id = cand_data.get("batch_id")
        print(f"Batch ID: {batch_id}")
    except Exception as e:
        print("Failed to parse Cand response:", res_cand.text)
        return

    # 3. Rank
    print("\n[3] Ranking Candidates...")
    rank_payload = {
        "job_id": job_id,
        "batch_id": batch_id,
        "weights": {
            "semantic_similarity": 40,
            "skill_match": 20,
            "experience_match": 15,
            "education_match": 10,
            "projects_match": 10,
            "behavioral_match": 5
        }
    }
    res_rank = requests.post(f"{BASE_URL}/api/candidates/rank", json=rank_payload)
    print("Response Status:", res_rank.status_code)
    try:
        rank_data = res_rank.json()
        print(f"Top Candidates: {len(rank_data.get('top_candidates', []))}")
        for c in rank_data.get('top_candidates', []):
            print(f" - {c['name']}: {c['score_breakdown']['total_score']*100:.1f}%")
    except Exception as e:
        print("Failed to parse Rank response:", res_rank.text)

    # 4. Export CSV
    print("\n[4] Exporting CSV...")
    res_csv = requests.get(f"{BASE_URL}/api/export/csv?job_id={job_id}&batch_id={batch_id}")
    print("CSV Export Status:", res_csv.status_code)
    if res_csv.status_code == 200:
        print("CSV Headers:", res_csv.headers.get("content-disposition"))

    # 5. Export PDF
    print("\n[5] Exporting PDF...")
    res_pdf = requests.get(f"{BASE_URL}/api/export/pdf?job_id={job_id}&batch_id={batch_id}")
    print("PDF Export Status:", res_pdf.status_code)
    if res_pdf.status_code == 200:
        print("PDF Headers:", res_pdf.headers.get("content-disposition"))
        
    print("\n--- End-to-End Test Complete ---")

if __name__ == "__main__":
    test_api()
