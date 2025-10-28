from django.urls import path
from . import views

urlpatterns = [
    path('history/', views.chat_history, name='chat_history'),
    path('clear/', views.clear_chat_history, name='clear_chat_history'),
]