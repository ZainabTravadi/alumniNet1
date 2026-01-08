import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

from flask import Flask, jsonify, request
from flask_cors import CORS

from firebase_admin import credentials, initialize_app
from firebase_admin import firestore as admin_firestore

# ============================================================
# 0. ENV + APP INIT
# ============================================================

load_dotenv()

app = Flask(__name__)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://alumninet.vercel.app"
]

# 🔥 GLOBAL CORS (correct + safe)
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "https://alumninet1-frontend.vercel.app/"
    ],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# 🔥 Explicit preflight handling (THIS FIXES VERSEL ↔ HEROKU)
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_response("")
        origin = request.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

# ============================================================
# 1. FIREBASE ADMIN INITIALIZATION (SINGLE SOURCE OF TRUTH)
# ============================================================

firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
firebase_client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
firebase_private_key = os.getenv("FIREBASE_PRIVATE_KEY")

if not all([firebase_project_id, firebase_client_email, firebase_private_key]):
    raise RuntimeError("❌ Missing Firebase environment variables")

firebase_cred = {
    "type": "service_account",
    "project_id": firebase_project_id,
    "client_email": firebase_client_email,
    "private_key": firebase_private_key.replace("\\n", "\n"),
    "token_uri": "https://oauth2.googleapis.com/token",
}

cred = credentials.Certificate(firebase_cred)
initialize_app(cred)

db = admin_firestore.client()

PORT = int(os.environ.get("PORT", 5000))

# ============================================================
# 2. UTILS
# ============================================================

def _format_date(val):
    return str(val) if val else "N/A"

def _map_firestore_to_mentor(data, doc_id):
    return {
        "id": doc_id,
        "name": data.get("displayName"),
        "title": data.get("title"),
        "company": data.get("company"),
        "batch": data.get("batch"),
        "department": data.get("department"),
        "location": data.get("location"),
        "avatar": data.get("avatarUrl"),
        "rating": data.get("rating", 0),
        "mentees": data.get("menteesCount", 0),
        "expertise": data.get("expertise", []),
        "bio": data.get("bio", ""),
        "availability": data.get("availability"),
        "responseTime": data.get("responseTime"),
        "languages": data.get("languages", ["English"])
    }

# ============================================================
# 3. API ROUTES
# ============================================================

@app.route("/api/dashboard/alumni")
def dashboard_alumni():
    docs = (
        db.collection("users")
        .order_by("createdAt", direction=admin_firestore.Query.DESCENDING)
        .limit(3)
        .stream()
    )
    return jsonify({"data": [{**d.to_dict(), "id": d.id} for d in docs]})

@app.route("/api/dashboard/events")
def dashboard_events():
    docs = (
        db.collection("events")
        .order_by("date", direction=admin_firestore.Query.ASCENDING)
        .limit(3)
        .stream()
    )
    return jsonify({
        "data": [{
            "title": e.get("title"),
            "date": _format_date(e.get("date")),
            "location": e.get("location"),
            "attendees": e.get("attendeeCount", 0)
        } for e in (d.to_dict() for d in docs)]
    })

@app.route("/api/directory/alumni")
def alumni_directory():
    docs = db.collection("users").order_by("displayName").limit(500).stream()
    return jsonify({
        "data": [{
            "id": d.id,
            "name": u.get("displayName"),
            "batch": u.get("batch"),
            "department": u.get("department"),
            "company": u.get("company"),
            "position": u.get("title"),
            "location": u.get("location"),
            "avatar": u.get("avatarUrl"),
            "skills": u.get("expertise", []),
            "linkedin": u.get("linkedinUrl", "#")
        } for d in docs for u in [d.to_dict()]]
    })

@app.route("/api/events/upcoming")
def upcoming_events():
    now = datetime.now() - timedelta(days=1)
    docs = (
        db.collection("events")
        .where("date", ">=", now)
        .order_by("date")
        .stream()
    )
    return jsonify({"data": [{**d.to_dict(), "id": d.id} for d in docs]})

@app.route("/api/events/past")
def past_events():
    now = datetime.now()
    docs = (
        db.collection("events")
        .where("date", "<", now)
        .order_by("date", direction=admin_firestore.Query.DESCENDING)
        .stream()
    )
    return jsonify({"data": [{**d.to_dict(), "id": d.id} for d in docs]})

@app.route("/api/mentorship/mentors")
def mentors():
    docs = (
        db.collection("users")
        .where("isMentor", "==", True)
        .order_by("rating", direction=admin_firestore.Query.DESCENDING)
        .limit(50)
        .stream()
    )
    return jsonify({"data": [_map_firestore_to_mentor(d.to_dict(), d.id) for d in docs]})

@app.route("/api/mentorship/requests")
def mentorship_requests():
    uid = request.args.get("user_id")
    if not uid:
        return jsonify({"data": []})
    docs = db.collection("mentorship_requests").where("menteeId", "==", uid).stream()
    return jsonify({"data": [{**d.to_dict(), "id": d.id} for d in docs]})

@app.route("/api/fundraising/data")
def fundraising():
    campaigns = [d.to_dict() | {"id": d.id} for d in db.collection("fundraising_campaigns").stream()]
    donors = [d.to_dict() for d in db.collection("fundraising_donations").order_by("date", direction=admin_firestore.Query.DESCENDING).limit(5).stream()]
    return jsonify({"status": "success", "data": {"campaigns": campaigns, "recentDonors": donors, "myDonations": []}})

@app.route("/api/<path:path>", methods=["OPTIONS"])
def options_handler(path):
    return "", 200

# ============================================================
# 4. RUN
# ============================================================

if __name__ == "__main__":
    print(f"🔥 Backend running on port {PORT}")
    app.run(host="0.0.0.0", port=PORT)
