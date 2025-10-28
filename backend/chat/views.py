from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from .models import ChatMessage
import json

@login_required
def chat_history(request):
    """
    Return chat history for the authenticated user
    """
    messages = ChatMessage.objects.filter(sender=request.user).order_by('-timestamp')[:50]
    history = [
        {
            'message': msg.message,
            'sender': msg.sender.username,
            'timestamp': msg.timestamp.isoformat(),
            'is_bot_response': msg.is_bot_response
        }
        for msg in messages
    ]
    return JsonResponse({'messages': history})

@require_http_methods(["POST"])
@login_required
def clear_chat_history(request):
    """
    Clear chat history for the authenticated user
    """
    ChatMessage.objects.filter(sender=request.user).delete()
    return JsonResponse({'status': 'success', 'message': 'Chat history cleared'})