from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.assistant import analyze_findings, generate_chat_response, get_security_suggestions

router = APIRouter(prefix="/assistant", tags=["assistant"])

class AnalyzeRequest(BaseModel):
    findings: List[dict]

class ChatRequest(BaseModel):
    query: str
    context: Optional[str] = None

@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.findings:
        raise HTTPException(status_code=400, detail="No findings provided")
    result = await analyze_findings(req.findings)
    return result

@router.post("/chat")
async def chat(req: ChatRequest):
    response = generate_chat_response(req.query, req.context)
    return {"response": response}

@router.get("/suggestions")
async def suggestions():
    tips = await get_security_suggestions()
    return {"suggestions": tips}
