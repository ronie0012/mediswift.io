from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "healthy",
        "message": "API is working correctly",
        "environment": request.META.get('DJANGO_SETTINGS_MODULE', 'unknown')
    })

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health_check'),
] 