"""Backend API tests for GPSC Elite Mock Master."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gpsc-elite-mock.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---- Subjects ----
def test_get_subjects(s):
    r = s.get(f"{API}/subjects", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 7
    for subj in data:
        assert subj["question_count"] == 10, f"{subj['key']} has {subj['question_count']} questions"
        assert subj["name_gu"]
        assert subj["key"]


# ---- Users ----
def test_create_user_valid(s):
    r = s.post(f"{API}/users", json={"name": "QA Tester"}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["name"] == "QA Tester"
    assert "id" in d
    # Idempotent: same name returns same id
    r2 = s.post(f"{API}/users", json={"name": "QA Tester"}, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["id"] == d["id"]


def test_create_user_too_short(s):
    r = s.post(f"{API}/users", json={"name": "A"}, timeout=15)
    assert r.status_code == 400


def test_create_user_empty(s):
    r = s.post(f"{API}/users", json={"name": "  "}, timeout=15)
    assert r.status_code == 400


# ---- Questions ----
def test_practice_questions_history(s):
    r = s.get(f"{API}/questions/practice/history?limit=10", timeout=15)
    assert r.status_code == 200
    qs = r.json()
    assert len(qs) == 10
    for q in qs:
        assert q["subject"] == "history"
        assert len(q["options"]) == 4
        assert 0 <= q["answer"] < 4


def test_practice_questions_invalid_subject(s):
    r = s.get(f"{API}/questions/practice/invalid_subject", timeout=15)
    assert r.status_code == 404


def test_mock_questions_per_subject_5(s):
    r = s.get(f"{API}/questions/mock?per_subject=5", timeout=15)
    assert r.status_code == 200
    qs = r.json()
    assert len(qs) == 35
    # Ensure all 7 subjects present
    subs = {q["subject"] for q in qs}
    assert len(subs) == 7


def test_mock_questions_default(s):
    r = s.get(f"{API}/questions/mock", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) == 70


# ---- Results & Leaderboard ----
@pytest.fixture(scope="module")
def test_user(s):
    r = s.post(f"{API}/users", json={"name": "TEST_ResultUser"}, timeout=15)
    return r.json()


def _sample_result_payload(user, mode="practice", subject="history", correct=7, wrong=2, skipped=1, net=6.34):
    breakdown = {subject: {"correct": correct, "wrong": wrong, "skipped": skipped, "total": correct + wrong + skipped}}
    return {
        "user_id": user["id"],
        "user_name": user["name"],
        "mode": mode,
        "subject": subject if mode == "practice" else None,
        "total_questions": correct + wrong + skipped,
        "correct": correct,
        "wrong": wrong,
        "skipped": skipped,
        "net_score": net,
        "time_taken_seconds": 300,
        "subject_breakdown": breakdown,
        "answers": [],
    }


def test_submit_result(s, test_user):
    payload = _sample_result_payload(test_user)
    r = s.post(f"{API}/results", json=payload, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "id" in d
    assert d["net_score"] == payload["net_score"]
    assert d["subject_breakdown"] == payload["subject_breakdown"]


def test_get_user_results(s, test_user):
    r = s.get(f"{API}/results/user/{test_user['id']}", timeout=15)
    assert r.status_code == 200
    results = r.json()
    assert isinstance(results, list)
    assert len(results) >= 1
    assert all(x["user_id"] == test_user["id"] for x in results)


def test_leaderboard_sorted(s, test_user):
    # Add a mock-mode result
    payload = _sample_result_payload(test_user, mode="mock", subject=None, correct=40, wrong=10, skipped=20, net=36.7)
    s.post(f"{API}/results", json=payload, timeout=15)

    r = s.get(f"{API}/leaderboard", timeout=15)
    assert r.status_code == 200
    entries = r.json()
    assert len(entries) >= 1
    scores = [e["net_score"] for e in entries]
    assert scores == sorted(scores, reverse=True)


def test_leaderboard_filter_mock(s):
    r = s.get(f"{API}/leaderboard?mode=mock", timeout=15)
    assert r.status_code == 200
    entries = r.json()
    for e in entries:
        assert e["mode"] == "mock"


def test_leaderboard_filter_practice(s):
    r = s.get(f"{API}/leaderboard?mode=practice", timeout=15)
    assert r.status_code == 200
    for e in r.json():
        assert e["mode"] == "practice"
