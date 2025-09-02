from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'AlumniNet API',
        'endpoints': {
            'admin': '/admin/',
            'accounts': '/api/accounts/',
            'events': '/api/events/',
            'forums': '/api/forums/',
            'mentorship': '/api/mentorship/',
            'fundraising': '/api/fundraising/',
        }
    })