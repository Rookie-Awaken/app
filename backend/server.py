from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

from questions_data import QUESTIONS_SEED, SUBJECTS_META, SUBJECT_ORDER

BANK_DIR = Path(__file__).parent / "questions_bank"


def _norm_answer(ans):
    """Accept answer as letter (A/B/C/D) or int (0-3). Return int 0-3."""
    if isinstance(ans, int):
        return ans
    if isinstance(ans, str):
        letter = ans.strip().upper()
        mapping = {"A": 0, "B": 1, "C": 2, "D": 3}
        if letter in mapping:
            return mapping[letter]
    raise ValueError(f"Invalid answer format: {ans!r}")


def _load_bank_questions() -> List[dict]:
    """Load all questions from JSON files under questions_bank/. Fallback to legacy seed if empty."""
    docs = []
    if BANK_DIR.exists():
        for f in sorted(BANK_DIR.glob("*.json")):
            subject_key = f.stem  # e.g. history.json -> history
            try:
                with open(f, "r", encoding="utf-8") as fh:
                    items = json.load(fh)
                for it in items:
                    docs.append({
                        "id": str(uuid.uuid4()),
                        "subject": it.get("subject", subject_key),
                        "question": it["question"],
                        "options": it["options"],
                        "answer": _norm_answer(it["answer"]),
                        "explanation": it["explanation"],
                    })
            except Exception as e:
                # Log and skip malformed file
                print(f"[seed] failed to load {f}: {e}")
    if not docs:
        # Fallback to legacy python-defined seed
        for q in QUESTIONS_SEED:
            docs.append({
                "id": str(uuid.uuid4()),
                "subject": q["subject"],
                "question": q["question"],
                "options": q["options"],
                "answer": _norm_answer(q["answer"]),
                "explanation": q["explanation"],
            })
    return docs


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="GPSC Elite Mock Master API")
api_router = APIRouter(prefix="/api")


# ============ MODELS ============
class UserCreate(BaseModel):
    name: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    subject: str
    question: str
    options: List[str]
    answer: int
    explanation: str


class QuestionPublic(BaseModel):
    """Question sent to frontend WITHOUT the answer/explanation to prevent cheating.
    But since app runs client-side and needs instant feedback, we'll send answer+explanation.
    (Client-side instant feedback is a product requirement.)"""
    id: str
    subject: str
    question: str
    options: List[str]
    answer: int
    explanation: str


class SubjectMeta(BaseModel):
    key: str
    name_gu: str
    name_en: str
    icon: str
    color: str
    question_count: int


class AnswerLog(BaseModel):
    question_id: str
    subject: str
    selected: Optional[int]  # None = skipped
    is_correct: bool


class ResultCreate(BaseModel):
    user_id: str
    user_name: str
    mode: str  # "practice" or "mock"
    subject: Optional[str] = None  # for practice mode
    total_questions: int
    correct: int
    wrong: int
    skipped: int
    net_score: float
    time_taken_seconds: int
    subject_breakdown: Dict[str, Dict[str, int]]  # {subject: {correct, wrong, skipped, total}}
    answers: List[AnswerLog]


class Result(ResultCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LeaderboardEntry(BaseModel):
    user_name: str
    mode: str
    subject: Optional[str]
    net_score: float
    total_questions: int
    correct: int
    created_at: str


# ============ SEED ============
@app.on_event("startup")
async def seed_questions():
    """Reseed questions if JSON bank differs from DB (drop + reload).
    This lets us add batches (history.json, polity.json ...) and just restart backend."""
    bank_docs = _load_bank_questions()
    bank_count = len(bank_docs)
    db_count = await db.questions.count_documents({})
    if db_count != bank_count and bank_count > 0:
        await db.questions.delete_many({})
        await db.questions.insert_many(bank_docs)
        logger.info(f"[seed] Replaced DB — dropped {db_count}, seeded {bank_count} questions")
    elif db_count == 0 and bank_count > 0:
        await db.questions.insert_many(bank_docs)
        logger.info(f"[seed] Seeded {bank_count} questions")
    else:
        logger.info(f"[seed] Skipped — DB has {db_count} questions (bank: {bank_count})")


# ============ ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "GPSC Elite Mock Master API", "status": "ok"}


@api_router.get("/subjects", response_model=List[SubjectMeta])
async def get_subjects():
    result = []
    for key in SUBJECT_ORDER:
        meta = SUBJECTS_META[key]
        count = await db.questions.count_documents({"subject": key})
        result.append(SubjectMeta(
            key=key,
            name_gu=meta["name_gu"],
            name_en=meta["name_en"],
            icon=meta["icon"],
            color=meta["color"],
            question_count=count,
        ))
    return result


@api_router.post("/users", response_model=User)
async def create_or_get_user(payload: UserCreate):
    name = payload.name.strip()
    if not name or len(name) < 2:
        raise HTTPException(status_code=400, detail="કૃપા કરી માન્ય નામ દાખલ કરો")
    if len(name) > 50:
        raise HTTPException(status_code=400, detail="નામ 50 અક્ષર થી ઓછું હોવું જોઈએ")
    # Return existing OR create new (name-based, no auth)
    existing = await db.users.find_one({"name": name}, {"_id": 0})
    if existing:
        return User(**existing)
    user = User(name=name)
    await db.users.insert_one(user.model_dump())
    return user


@api_router.get("/questions/practice/{subject}", response_model=List[QuestionPublic])
async def get_practice_questions(subject: str, limit: int = 10):
    if subject not in SUBJECTS_META:
        raise HTTPException(status_code=404, detail="વિષય ઉપલબ્ધ નથી")
    docs = await db.questions.find({"subject": subject}, {"_id": 0}).to_list(1000)
    random.shuffle(docs)
    return [QuestionPublic(**d) for d in docs[:limit]]


@api_router.get("/questions/mock", response_model=List[QuestionPublic])
async def get_mock_questions(per_subject: int = 10):
    """Full mock: pull `per_subject` random questions from each subject."""
    all_qs: List[QuestionPublic] = []
    for subject in SUBJECT_ORDER:
        docs = await db.questions.find({"subject": subject}, {"_id": 0}).to_list(1000)
        random.shuffle(docs)
        for d in docs[:per_subject]:
            all_qs.append(QuestionPublic(**d))
    random.shuffle(all_qs)
    return all_qs


@api_router.post("/results", response_model=Result)
async def submit_result(payload: ResultCreate):
    result = Result(**payload.model_dump())
    doc = result.model_dump()
    await db.results.insert_one(doc)
    return result


@api_router.get("/results/user/{user_id}", response_model=List[Result])
async def get_user_results(user_id: str):
    docs = await db.results.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return [Result(**d) for d in docs]


@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(mode: Optional[str] = None, subject: Optional[str] = None, limit: int = 20):
    query: Dict = {}
    if mode:
        query["mode"] = mode
    if subject:
        query["subject"] = subject
    docs = await db.results.find(query, {"_id": 0}).sort("net_score", -1).to_list(limit)
    return [LeaderboardEntry(
        user_name=d["user_name"],
        mode=d["mode"],
        subject=d.get("subject"),
        net_score=d["net_score"],
        total_questions=d["total_questions"],
        correct=d["correct"],
        created_at=d["created_at"],
    ) for d in docs]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
