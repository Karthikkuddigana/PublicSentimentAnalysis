# app/services/background_worker.py

from app.services.job_store import JOB_STORE
from app.services.ingestion_orchestrator import run_ingestion
from app.services.crisis_service import detect_crisis
from app.services.benchmark_service import BenchmarkTimer


def process_job(job_id: str, req_data: dict):

    try:
        timer = BenchmarkTimer()

        result = run_ingestion(
            source=req_data["source"],
            brand=req_data["brand"],
            keyword=req_data["keyword"],
            benchmark=req_data["benchmark"],
            storage=req_data["storage"],
        )

        timer.mark("ingestion_complete")

        crisis_report = detect_crisis(result.get("comments", []))

        timer.mark("crisis_analysis_complete")

        JOB_STORE[job_id] = {
            "status": "completed",
            "records": result.get("records"),
            "file": result.get("file"),
            "crisis_analysis": crisis_report,
            "performance_metrics": timer.report()
        }

    except Exception as e:
        JOB_STORE[job_id] = {
            "status": "failed",
            "error": str(e)
        }