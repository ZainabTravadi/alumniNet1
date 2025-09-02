from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/events/', include('events.urls')),
    path('api/forums/', include('forums.urls')),
    path('api/mentorship/', include('mentorship.urls')),
    path('api/fundraising/', include('fundraising.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
