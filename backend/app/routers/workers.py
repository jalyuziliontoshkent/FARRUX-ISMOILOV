"""
Workers router - /api/workers/*
"""
from typing import List
from fastapi import APIRouter, Depends
from app.schemas.users import WorkerCreate
from app.services.worker_service import WorkerService
from app.deps import require_admin

router = APIRouter(prefix="/workers", tags=["workers"])
worker_service = WorkerService()


@router.post("")
async def create_worker(data: WorkerCreate, admin: dict = Depends(require_admin)):
    """Create worker."""
    return await worker_service.create(data)


@router.get("")
async def list_workers(admin: dict = Depends(require_admin)) -> List[dict]:
    """List all workers."""
    return await worker_service.list_all()


@router.delete("/{worker_id}")
async def delete_worker(worker_id: str, admin: dict = Depends(require_admin)):
    """Delete worker."""
    await worker_service.delete(int(worker_id))
    return {"message": "Deleted"}
