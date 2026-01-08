import os
from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app
from firebase_admin import firestore as admin_firestore 
from flask import Flask, jsonify, request
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv() 

# --- 1. FIREBASE ADMIN SDK INITIALIZATION (CRITICAL FOR ALL BACKEND FILES) ---

SERVICE_ACCOUNT_KEY_PATH = os.getenv("SERVICE_ACCOUNT_KEY_PATH")

if not SERVICE_ACCOUNT_KEY_PATH:
    raise Exception("FATAL ERROR: SERVICE_ACCOUNT_KEY_PATH not set in .env or environment.")

try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH) 
    initialize_app(cred)
except FileNotFoundError:
    raise Exception(f"FATAL ERROR: Service account key not found at {SERVICE_ACCOUNT_KEY_PATH}. Check the path.")

db = admin_firestore.client() 

# --- 2. FLASK APP SETUP ---

app = Flask(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8081") 
CORS(app, origins=[FRONTEND_URL]) 

PORT = int(os.environ.get("PORT", 5000))


# --- 3. API ENDPOINT ---

@app.route('/api/directory/alumni', methods=['GET'])
def get_full_alumni_directory():
    """
    Fetches the full list of alumni, ensuring the data matches the frontend's
    required fields (name, batch, position, skills, linkedin, etc.).
    Endpoint: GET /api/directory/alumni
    """
    try:
        # Fetch up to 500 alumni, ordered by name (adjust limit as needed)
        alumni_ref = db.collection('users').order_by('displayName').limit(500)
        docs = alumni_ref.stream()
        
        alumni_list = []
        for doc in docs:
            alumni_data = doc.to_dict()
            
            # Map Firestore data to the exact keys expected by the React component
            alumni_list.append({
                'id': doc.id, 
                'name': alumni_data.get('displayName', 'Unknown Alumnus'),
                'batch': alumni_data.get('batch', 'N/A'),
                'department': alumni_data.get('department', 'N/A'),
                'company': alumni_data.get('company', 'N/A'),
                'position': alumni_data.get('title', 'N/A'),
                'location': alumni_data.get('location', 'Global'),
                'avatar': alumni_data.get('avatarUrl', '/placeholder-avatar.jpg'),
                # The frontend uses 'skills' but Firestore has 'expertise'
                'skills': alumni_data.get('expertise', []), 
                # Assuming 'linkedin' is stored in Firestore with that key
                'linkedin': alumni_data.get('linkedinUrl', '#') 
            })

        return jsonify({"data": alumni_list}), 200

    except Exception as e:
        print(f"Error fetching full alumni directory: {e}")
        return jsonify({"error": "Failed to retrieve alumni directory."}), 500


# --- 4. RUN SERVER ---

if __name__ == '__main__':
    # You must run this file separately from dashboard.py
    print("Running Directory API on port 5000...")
    app.run(host='0.0.0.0', port=PORT, debug=True)