from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

class Command(BaseCommand):
    help = 'Test WebSocket functionality'

    def handle(self, *args, **options):
        channel_layer = get_channel_layer()
        
        if channel_layer is not None:
            # Test sending a message to a group
            async_to_sync(channel_layer.group_send)(
                "chat_test",
                {
                    "type": "chat.message",
                    "message": "Hello from management command!",
                    "sender": "System",
                    "is_bot": True
                }
            )
            
            self.stdout.write('Successfully sent test message')
        else:
            self.stdout.write('Channel layer is not configured')