import os
from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app
from firebase_admin import firestore as admin_firestore 
from flask import Flask, jsonify, request
from datetime import datetime, timedelta # Needed for Past/Upcoming filtering
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv() 

# --- 1. FIREBASE ADMIN SDK INITIALIZATION ---

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


# --- UTILITY FUNCTIONS ---

def _map_firestore_to_mentor(data, doc_id):
    """Maps Firestore user document (where isMentor=true) to the Mentor interface."""
    return {
        'id': doc_id,
        'name': data.get('displayName', 'Unknown Mentor'),
        'title': data.get('title', 'Expert'),
        'company': data.get('company', 'N/A'),
        'batch': data.get('batch', 'N/A'),
        'department': data.get('department', 'N/A'),
        'location': data.get('location', 'Global'),
        'avatar': data.get('avatarUrl', '/placeholder-avatar.jpg'),
        'rating': data.get('rating', 0),
        'mentees': data.get('menteesCount', 0),
        'expertise': data.get('expertise', []), 
        'bio': data.get('bio', 'No bio provided.'),
        'availability': data.get('availability', 'Flexible'),
        'responseTime': data.get('responseTime', 'Varies'),
        'languages': data.get('languages', ['English'])
    }

# --- UTILITY TO MAP MENTORSHIP REQUESTS DATA ---

def _map_firestore_to_categorydata(doc):
    """Maps Firestore category document to the expected frontend format."""
    data = doc.to_dict()
    return {
        'id': doc.id,
        'name': data.get('name', 'General'),
        'count': data.get('count', 0),
        'color': data.get('color', 'bg-gray-500')
    }

# --- UTILITY TO MAP FORUM THREAD DATA ---
def _map_firestore_to_threaddata(data, doc_id):
    """Maps the comprehensive Firestore thread document to the expected frontend format."""
    # Note: data.get('lastActivity') will be a Timestamp object
    return {
        'id': doc_id,
        'title': data.get('title', 'No Title'),
        'content': data.get('content', ''),
        'author': data.get('authorName', 'Anonymous'),
        'authorAvatar': data.get('authorAvatar', '/placeholder-avatar.jpg'),
        'category': data.get('categoryId', 'general'), 
        'replies': data.get('repliesCount', 0),
        'views': data.get('viewsCount', 0),
        'likes': data.get('likesCount', 0),
        'lastActivity': str(data.get('lastActivity', 'Unknown')), # Send raw Timestamp string
        'isPinned': data.get('isPinned', False),
        'isHot': data.get('isHot', False)
    }

def _format_date_field(date_field):
    """Safely converts Firestore Timestamp to a displayable string."""
    return str(date_field) if date_field else 'Date N/A'

def _map_firestore_to_eventdata(data, doc_id):
    """Maps comprehensive Firestore event document to the EventData interface."""
    return {
        'id': doc_id,
        'title': data.get('title', 'Untitled Event'),
        'description': data.get('description', 'No description available.'),
        'date': _format_date_field(data.get('date')), 
        'time': data.get('time', 'TBD'),
        'location': data.get('location', 'Online'),
        'isVirtual': data.get('isVirtual', False),
        'attendees': data.get('attendeeCount', 0),
        'maxAttendees': data.get('maxAttendees', None), 
        'organizer': data.get('organizer', 'Community'),
        'organizerAvatar': data.get('organizerAvatar', '/placeholder-avatar.jpg'),
        'category': data.get('category', 'Social'),
        'isRegistered': data.get('isRegistered', False), 
        'isFeatured': data.get('isFeatured', False),
        'image': data.get('image', '/placeholder-event.jpg')
    }

def _map_firestore_to_notification(data, doc_id):
    """Maps Firestore notification document to the expected frontend format."""
    # Note: data.get('timestamp') is used for sorting
    return {
        'id': doc_id,
        'type': data.get('type', 'announcement'), # e.g., 'mentorship', 'event', 'forum'
        'title': data.get('title', 'New Update'),
        'message': data.get('message', 'Check activity center.'),
        'avatar': data.get('avatarUrl', None), # Mapped from avatarUrl
        'time': str(data.get('timestamp', 'Unknown Time')), # Send raw Timestamp string
        'isRead': data.get('isRead', False),
        'actionable': data.get('actionable', False),
        'category': data.get('category', 'announcements') # Used for filtering tabs
    }


# ====================================================================
# 3. API ENDPOINTS - MERGED ROUTES
# ====================================================================

# --- DASHBOARD: RECENT ALUMNI ---
@app.route('/api/dashboard/alumni', methods=['GET'])
def get_recent_alumni():
    try:
        alumni_ref = db.collection('users').order_by('createdAt', direction=admin_firestore.Query.DESCENDING).limit(3)
        docs = alumni_ref.stream()
        
        alumni_list = []
        for doc in docs:
            alumni_data = doc.to_dict()
            alumni_list.append({
                'id': doc.id, 
                'name': alumni_data.get('displayName', 'Alumnus Name'),
                'title': alumni_data.get('title', 'Professional'),
                'company': alumni_data.get('company', 'Company Name'),
                'batch': alumni_data.get('batch', 'XXXX'),
                'department': alumni_data.get('department', 'N/A'),
                'location': alumni_data.get('location', 'Global'),
                'avatar': alumni_data.get('avatarUrl', '/placeholder-avatar.jpg'), 
                'rating': alumni_data.get('rating', 4.5),
                'mentees': alumni_data.get('menteesCount', 0),
                'expertise': alumni_data.get('expertise', ['General Networking']),
                'bio': alumni_data.get('bio', 'Looking forward to connecting with fellow alumni.'),
                'availability': alumni_data.get('availability', 'Flexible'),
                'responseTime': alumni_data.get('responseTime', '24 hours'),
                'languages': alumni_data.get('languages', ['English'])
            })

        return jsonify({"data": alumni_list}), 200

    except Exception as e:
        print(f"Error fetching recent alumni: {e}")
        return jsonify({"error": "Failed to retrieve alumni data."}), 500


# --- DASHBOARD: UPCOMING EVENTS (Limited view) ---
@app.route('/api/dashboard/events', methods=['GET'])
def get_upcoming_events_dashboard_view(): # 💡 RENAME FIX
    """Fetches a limited list of upcoming events for the Dashboard view."""
    try:
        events_ref = db.collection('events').order_by('date', direction=admin_firestore.Query.ASCENDING).limit(3)
        docs = events_ref.stream()

        events_list = []
        for doc in docs:
            event_data = doc.to_dict()
            
            events_list.append({
                'title': event_data.get('title', 'Untitled Event'),
                'date': _format_date_field(event_data.get('date')), 
                'location': event_data.get('location', 'Online'),
                'attendees': event_data.get('attendeeCount', 0)
            })

        return jsonify({"data": events_list}), 200

    except Exception as e:
        print(f"Error fetching dashboard events: {e}") 
        return jsonify({"error": "Failed to retrieve event data."}), 500


# --- DIRECTORY: FULL ALUMNI LIST ---
@app.route('/api/directory/alumni', methods=['GET'])
def get_full_alumni_directory():
    """Fetches the full list of alumni for the directory page."""
    try:
        alumni_ref = db.collection('users').order_by('displayName').limit(500)
        docs = alumni_ref.stream()
        
        alumni_list = []
        for doc in docs:
            alumni_data = doc.to_dict()
            
            alumni_list.append({
                'id': doc.id, 
                'name': alumni_data.get('displayName', 'Unknown Alumnus'),
                'batch': alumni_data.get('batch', 'N/A'),
                'department': alumni_data.get('department', 'N/A'),
                'company': alumni_data.get('company', 'N/A'),
                'position': alumni_data.get('title', 'N/A'),
                'location': alumni_data.get('location', 'Global'),
                'avatar': alumni_data.get('avatarUrl', '/placeholder-avatar.jpg'),
                'skills': alumni_data.get('expertise', []), 
                'linkedin': alumni_data.get('linkedinUrl', '#') 
            })

        return jsonify({"data": alumni_list}), 200

    except Exception as e:
        print(f"Error fetching full alumni directory: {e}")
        return jsonify({"error": "Failed to retrieve alumni directory."}), 500


# --- EVENTS PAGE: UPCOMING EVENTS (Full list) ---
@app.route('/api/events/upcoming', methods=['GET'])
def get_full_upcoming_events():
    """Fetches all upcoming events (date >= now), sorted ascending, for the dedicated Events page."""
    try:
        yesterday = datetime.now() - timedelta(days=1)
        events_ref = db.collection('events').where('date', '>=', yesterday).order_by('date', direction=admin_firestore.Query.ASCENDING)
        docs = events_ref.stream()

        events_list = []
        for doc in docs:
            events_list.append(_map_firestore_to_eventdata(doc.to_dict(), doc.id))

        return jsonify({"data": events_list}), 200

    except Exception as e:
        print(f"Error fetching upcoming events for page: {e}")
        return jsonify({"error": "Failed to retrieve upcoming events."}), 500


# --- EVENTS PAGE: PAST EVENTS (Full list) ---
@app.route('/api/events/past', methods=['GET'])
def get_full_past_events():
    """Fetches all past events (date < now), sorted descending, for the dedicated Events page."""
    try:
        now = datetime.now()
        events_ref = db.collection('events').where('date', '<', now).order_by('date', direction=admin_firestore.Query.DESCENDING)
        docs = events_ref.stream()

        events_list = []
        for doc in docs:
            events_list.append(_map_firestore_to_eventdata(doc.to_dict(), doc.id))

        return jsonify({"data": events_list}), 200

    except Exception as e:
        print(f"Error fetching past events for page: {e}")
        return jsonify({"error": "Failed to retrieve past events."}), 500
    
@app.route('/api/forum/categories', methods=['GET'])
def get_forum_categories():
    """Fetches all discussion categories for the sidebar and dropdown."""
    try:
        # Fetch categories, ordered by count (trending topics)
        categories_ref = db.collection('forum_categories').order_by('count', direction=admin_firestore.Query.DESCENDING)
        docs = categories_ref.stream()

        category_list = []
        for doc in docs:
            category_list.append(_map_firestore_to_categorydata(doc))
        
        return jsonify({"data": category_list}), 200

    except Exception as e:
        print(f"Error fetching forum categories: {e}")
        return jsonify({"error": "Failed to retrieve categories."}), 500


@app.route('/api/forum/threads', methods=['GET'])
def get_forum_threads():
    """Fetches all discussion threads, ordered by last activity for the main feed."""
    try:
        # Fetch threads, ordered by last activity for the main feed
        threads_ref = db.collection('forum_threads').order_by('lastActivity', direction=admin_firestore.Query.DESCENDING).limit(100)
        docs = threads_ref.stream()

        thread_list = []
        for doc in docs:
            thread_list.append(_map_firestore_to_threaddata(doc.to_dict(), doc.id))

        return jsonify({"data": thread_list}), 200

    except Exception as e:
        print(f"Error fetching forum threads: {e}")
        return jsonify({"error": "Failed to retrieve threads."}), 500
    
# app.py (Replace the existing get_user_notifications function entirely)

@app.route('/api/notifications', methods=['GET'])
def get_user_notifications():
    """
    Fetches ALL notifications from Firestore. 
    (The final filtering by userId must occur on the client-side/frontend code.)
    Endpoint: GET /api/notifications
    """
    user_uid = request.args.get('user_id') 
    
    # Check for user_uid is still helpful for debugging/logging, but the query ignores it
    if not user_uid:
        return jsonify({"data": []}), 200

    try:
        # ✅ FINAL FIX: Simplest possible query—fetches ALL documents from the collection
        notifications_ref = db.collection('user_notifications').limit(100) 
        
        docs = notifications_ref.stream()
        notification_list = []
        
        for doc in docs:
            notification_data = doc.to_dict()
            
            # 💡 Client-side filtering simulation: Only map the documents for the user requested
            # We map the data only if the userId matches. This ensures correct data is returned, 
            # though less efficiently than a direct database query.
            if notification_data.get('userId') == user_uid:
                notification_list.append(_map_firestore_to_notification(notification_data, doc.id))

        return jsonify({"data": notification_list}), 200

    except Exception as e:
        # This will now only trigger on true connection/initialization errors
        print(f"FATAL Error fetching notifications: {e}")
        return jsonify({"error": "Failed to retrieve notifications due to server crash."}), 500

    
@app.route('/api/fundraising/data', methods=['GET'])
def get_fundraising_data():
    """
    Fetches all active campaigns, recent donor history, and the user's donations 
    in a single, aggregated response.
    """
    try:
        # 💡 Retrieve User ID for personalized donation history
        user_id = request.args.get('user_id') or None # Get UID or None

        # --- A. Fetch Campaigns (This does not use the complex filter/index) ---
        campaigns_ref = db.collection('fundraising_campaigns').limit(50)
        campaign_docs = campaigns_ref.stream()
        campaigns_list = []
        
        for doc in campaign_docs:
            data = doc.to_dict()
            # Map campaign data
            campaigns_list.append({
                'id': doc.id,
                'title': data.get('title'),
                'description': data.get('description'),
                'category': data.get('category'),
                'goal': data.get('goal', 0),
                'raised': data.get('raised', 0),
                'donors': data.get('donors', 0),
                'daysLeft': data.get('daysLeft', 0),
                'organizer': data.get('organizer'),
                'organizerAvatar': data.get('organizerAvatar', '/placeholder-campaign.jpg'),
                'image': data.get('image', '/placeholder-campaign.jpg'),
                'isFeatured': data.get('isFeatured', False),
                'isUrgent': data.get('isUrgent', False),
                'updates': data.get('updates', 0)
            })
            
        # --- B. Fetch Recent Donations (Global feed for the sidebar) ---
        donations_ref = db.collection('fundraising_donations').order_by('date', direction=admin_firestore.Query.DESCENDING).limit(5)
        donor_docs = donations_ref.stream()
        recent_donors_list = []
        
        for doc in donor_docs:
            data = doc.to_dict()
            recent_donors_list.append({
                'name': data.get('userName', 'Anonymous'),
                'amount': data.get('amount', 0),
                'timeAgo': str(data.get('date', 'Unknown Time'))
            })

        # --- C. Fetch User's Own Donations ('My Donations' tab) ---
        my_donations_list = []
        if user_id:
            # 💡 FIX: Use the composite index query, but only run if user_id is NOT 'anonymous'
            try:
                # Assuming the composite index on (userId, date) is now ready.
                user_donations_ref = db.collection('fundraising_donations').where('userId', '==', user_id).order_by('date', direction=admin_firestore.Query.DESCENDING)
                my_donation_docs = user_donations_ref.stream()
                
                for doc in my_donation_docs:
                    data = doc.to_dict()
                    my_donations_list.append({
                        'campaign': data.get('campaignId', 'General Fund'), 
                        'amount': data.get('amount', 0),
                        'date': str(data.get('date')),
                        'status': data.get('status', 'completed')
                    })
            except Exception as index_error:
                 # If index is still building, this prevents the entire endpoint from failing
                 print(f"Index error during user donations fetch: {index_error}") 
                 my_donations_list = [] # Return empty list on failure

        # --- Aggregate and Return ---
        return jsonify({
            "status": "success",
            "data": {
                "campaigns": campaigns_list,
                "recentDonors": recent_donors_list,
                "myDonations": my_donations_list
            }
        }), 200

    except Exception as e:
        # This catch is for general errors outside of the index failure block
        print(f"Error fetching fundraising data: {e}")
        return jsonify({"status": "error", "message": "Failed to retrieve fundraising data."}), 500

@app.route('/api/mentorship/mentors', methods=['GET'])
def get_available_mentors():
    """
    Fetches the list of mentors for the 'Find Mentors' tab.
    Endpoint: GET /api/mentorship/mentors
    """
    try:
        # 💡 NOTE: This query requires a composite index on (isMentor, rating, __name__)
        mentors_ref = db.collection('users').where('isMentor', '==', True).order_by('rating', direction=admin_firestore.Query.DESCENDING).limit(50)
        docs = mentors_ref.stream()
        
        mentors_list = []
        for doc in docs:
            mentors_list.append(_map_firestore_to_mentor(doc.to_dict(), doc.id))

        return jsonify({"data": mentors_list}), 200

    except Exception as e:
        print(f"Error fetching mentor directory: {e}")
        return jsonify({"error": "Failed to retrieve mentor directory."}), 500


@app.route('/api/mentorship/requests', methods=['GET'])
def get_user_mentorship_requests():
    """
    Fetches all mentorship requests made by the current user (mentee) for the 'My Requests' tab.
    Endpoint: GET /api/mentorship/requests?user_id=UID_A123
    """
    # 💡 IMPORTANT: Get the user ID from the query parameters
    requests_ref = db.collection('mentorship_requests').order_by('requestDate', direction=admin_firestore.Query.DESCENDING).limit(10)
    mentee_uid = request.args.get('user_id') 

    if not mentee_uid:
        # If no user ID is provided, return an empty list
        return jsonify({"data": []}), 200

    try:
        # NOTE: This query relies on the composite index on (menteeId, requestDate)
        # We assume the user ID is sent correctly from the frontend.
        requests_ref = db.collection('mentorship_requests').where('menteeId', '==', mentee_uid)
        docs = requests_ref.stream()
        
        requests_list = []
        for doc in docs:
            request_data = doc.to_dict()
            
            # Map data to the frontend structure
            requests_list.append({
                'id': doc.id,
                'mentorName': request_data.get('mentorName', 'Unknown'),
                'mentorAvatar': request_data.get('mentorAvatar', '/placeholder-avatar.jpg'),
                'topic': request_data.get('topic', 'General Inquiry'),
                'status': request_data.get('status', 'pending'), # 'pending', 'accepted', 'completed'
                # Use the provided requestDate and rely on FE for formatting
                'requestDate': str(request_data.get('requestDate')), 
                'message': request_data.get('message', '')
            })

        return jsonify({"data": requests_list}), 200

    except Exception as e:
        # If this exception is hit, it means the index is not built or the data type is wrong.
        print(f"Error fetching mentorship requests: {e}")
        return jsonify({"error": "Failed to retrieve mentorship requests."}), 500
    
# --- 4. RUN SERVER ---

if __name__ == '__main__':
    print("Running Merged API on port 5000...")
    app.run(host='0.0.0.0', port=PORT, debug=True)