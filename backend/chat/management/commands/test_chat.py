from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from chat.models import ChatMessage, ChatSession

class Command(BaseCommand):
    help = 'Test chat functionality'

    def handle(self, *args, **options):
        self.stdout.write("Testing chat functionality...")
        
        # Test database models
        try:
            # Get or create a test user
            user, created = User.objects.get_or_create(
                username='testuser',
                defaults={'email': 'test@example.com'}
            )
            
            if created:
                self.stdout.write(f"Created test user: {user.username}")
            else:
                self.stdout.write(f"Using existing test user: {user.username}")
            
            # Create a test chat session
            session, created = ChatSession.objects.get_or_create(
                user=user,
                is_active=True
            )
            
            if created:
                self.stdout.write(f"Created chat session: {session.id}")
            else:
                self.stdout.write(f"Using existing chat session: {session.id}")
            
            # Create test messages
            user_message = ChatMessage.objects.create(
                sender=user,
                message="Test user message",
                is_bot_response=False
            )
            
            bot_message = ChatMessage.objects.create(
                sender=user,
                message="Test bot response",
                is_bot_response=True
            )
            
            self.stdout.write(f"Created user message: {user_message.id}")
            self.stdout.write(f"Created bot message: {bot_message.id}")
            
            # Test message retrieval
            messages = ChatMessage.objects.filter(sender=user).order_by('timestamp')
            self.stdout.write(f"Total messages for user: {messages.count()}")
            
            for msg in messages:
                sender_type = "Bot" if msg.is_bot_response else "User"
                self.stdout.write(f"  {sender_type}: {msg.message[:50]}...")
            
            self.stdout.write(self.style.SUCCESS("Chat functionality test completed successfully!"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Test failed: {e}"))