# AlumniNet Backend

Django REST API backend for the AlumniNet application.

## Features

- **User Management**: Custom user model with alumni-specific fields
- **Events**: Event creation, registration, and management
- **Forums**: Discussion forums with categories, replies, and likes
- **Mentorship**: Mentor-mentee matching and request system
- **Fundraising**: Campaign management and donation tracking

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create superuser:
```bash
python manage.py createsuperuser
```

5. Run development server:
```bash
python manage.py runserver
```

## API Endpoints

### Accounts
- `GET/PUT /api/accounts/profile/` - User profile
- `GET /api/accounts/directory/` - Alumni directory
- `GET /api/accounts/dashboard-stats/` - Dashboard statistics

### Events
- `GET/POST /api/events/` - Events list/create
- `GET/PUT/DELETE /api/events/{id}/` - Event detail
- `POST /api/events/register/` - Register for event
- `DELETE /api/events/{id}/unregister/` - Unregister from event

### Forums
- `GET /api/forums/categories/` - Forum categories
- `GET/POST /api/forums/discussions/` - Discussions
- `GET/PUT/DELETE /api/forums/discussions/{id}/` - Discussion detail
- `GET/POST /api/forums/discussions/{id}/replies/` - Replies

### Mentorship
- `GET /api/mentorship/mentors/` - Available mentors
- `GET/POST /api/mentorship/requests/` - Mentorship requests
- `GET/PUT /api/mentorship/requests/{id}/` - Request detail

### Fundraising
- `GET/POST /api/fundraising/campaigns/` - Campaigns
- `GET/PUT/DELETE /api/fundraising/campaigns/{id}/` - Campaign detail
- `GET/POST /api/fundraising/donations/` - Donations

## Models

The backend includes comprehensive models for:
- Custom User with alumni fields
- Events and registrations
- Forum discussions and replies
- Mentor profiles and requests
- Fundraising campaigns and donations

All models include proper relationships, validation, and admin interfaces.