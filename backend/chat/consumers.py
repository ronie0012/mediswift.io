import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs
import asyncio
import logging
from django.contrib.auth.models import User
from .models import ChatMessage, ChatSession

logger = logging.getLogger(__name__)

# Comprehensive medicine knowledge base
MEDICINE_KNOWLEDGE = {
    "headache": {
        "common_medicines": [
            {"name": "Paracetamol 500mg", "use": "General pain relief", "dosage": "1-2 tablets every 4-6 hours", "price": "₹12-15"},
            {"name": "Aspirin 75mg", "use": "Pain and inflammation relief", "dosage": "1 tablet daily or as prescribed", "price": "₹8-10"},
            {"name": "Ibuprofen 200mg", "use": "Pain and inflammation relief", "dosage": "1-2 tablets every 6-8 hours", "price": "₹15-20"}
        ],
        "info": "For headaches, over-the-counter pain relievers can be effective. However, if you experience severe or persistent headaches, it's important to consult with a healthcare professional."
    },
    "fever": {
        "common_medicines": [
            {"name": "Paracetamol 500mg", "use": "Fever and pain relief", "dosage": "1-2 tablets every 4-6 hours", "price": "₹12-15"},
            {"name": "Ibuprofen 200mg", "use": "Fever and inflammation relief", "dosage": "1-2 tablets every 6-8 hours", "price": "₹15-20"}
        ],
        "info": "Fever is often a sign that your body is fighting an infection. Stay hydrated and rest. If fever persists above 103°F (39.4°C) or lasts more than 3 days, seek medical attention."
    },
    "cold": {
        "common_medicines": [
            {"name": "Cetirizine 10mg", "use": "Antihistamine for allergies and cold symptoms", "dosage": "1 tablet daily", "price": "₹12-15"},
            {"name": "Paracetamol 500mg", "use": "Fever and pain relief", "dosage": "1-2 tablets every 4-6 hours", "price": "₹12-15"},
            {"name": "Levocetirizine 5mg", "use": "Non-drowsy antihistamine", "dosage": "1 tablet daily", "price": "₹22-25"}
        ],
        "info": "Common cold symptoms usually resolve on their own within 7-10 days. Rest, stay hydrated, and use over-the-counter medications to manage symptoms."
    },
    "cough": {
        "common_medicines": [
            {"name": "Dextromethorphan", "use": "Cough suppressant", "dosage": "10-20mg every 4-8 hours", "price": "₹20-30"},
            {"name": "Guaifenesin", "use": "Expectorant to loosen mucus", "dosage": "200-400mg every 4 hours", "price": "₹15-25"}
        ],
        "info": "Coughs can be dry or productive. Dry coughs may benefit from suppressants, while productive coughs may benefit from expectorants. If cough persists beyond 2-3 weeks, consult a doctor."
    },
    "stomach ache": {
        "common_medicines": [
            {"name": "Omeprazole 20mg", "use": "Reduces stomach acid production", "dosage": "1 capsule daily before breakfast", "price": "₹15-18"},
            {"name": "Pantoprazole 40mg", "use": "Acid reducer for heartburn and stomach pain", "dosage": "1 tablet daily before meal", "price": "₹30-35"}
        ],
        "info": "Stomach aches can have various causes. For occasional indigestion, antacids may help. Persistent or severe stomach pain should be evaluated by a healthcare provider."
    },
    "allergy": {
        "common_medicines": [
            {"name": "Cetirizine 10mg", "use": "Antihistamine for allergies", "dosage": "1 tablet daily", "price": "₹12-15"},
            {"name": "Levocetirizine 5mg", "use": "Non-drowsy antihistamine", "dosage": "1 tablet daily", "price": "₹22-25"},
            {"name": "Montelukast 10mg", "use": "Leukotriene receptor antagonist", "dosage": "1 tablet daily in the evening", "price": "₹65-70"}
        ],
        "info": "Allergy symptoms can include sneezing, runny nose, itchy eyes, and skin rashes. Antihistamines are commonly used to manage these symptoms. For severe allergies, consult an allergist."
    },
    "heart": {
        "common_medicines": [
            {"name": "Amlodipine 5mg", "use": "Calcium channel blocker for high blood pressure", "dosage": "1 tablet daily", "price": "₹18-22"},
            {"name": "Atorvastatin 10mg", "use": "Cholesterol lowering medication", "dosage": "1 tablet daily", "price": "₹22-28"}
        ],
        "info": "Heart and blood pressure medications should only be taken under medical supervision. Never start or stop these medications without consulting a healthcare provider."
    },
    "digestive": {
        "common_medicines": [
            {"name": "Omeprazole 20mg", "use": "Proton pump inhibitor for acid reflux", "dosage": "1 capsule daily before breakfast", "price": "₹15-18"},
            {"name": "Pantoprazole 40mg", "use": "Acid reducer for heartburn", "dosage": "1 tablet daily before meal", "price": "₹30-35"}
        ],
        "info": "For digestive issues, lifestyle changes like diet modification and stress management are often as important as medications. Consult a gastroenterologist for persistent issues."
    }
}

# Common symptoms and keywords
SYMPTOM_KEYWORDS = {
    "headache": ["headache", "head ache", "migraine", "head pain", "head ache"],
    "fever": ["fever", "temperature", "hot", "chills", "high temperature"],
    "cold": ["cold", "runny nose", "stuffy nose", "sneezing", "common cold"],
    "cough": ["cough", "coughing", "dry cough", "wet cough"],
    "stomach ache": ["stomach ache", "stomach pain", "belly pain", "abdominal pain", "indigestion", "gastric"],
    "allergy": ["allergy", "allergic", "sneeze", "itchy", "rash", "hay fever"],
    "heart": ["heart", "blood pressure", "hypertension", "cardiac"],
    "digestive": ["digestive", "stomach", "acid", "reflux", "heartburn", "gastric"]
}

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Try to authenticate user from token in query string
        await self.authenticate_user()
        
        if not hasattr(self, 'user') or self.user.is_anonymous:
            # Reject the connection if user is not authenticated
            await self.close()
            return
            
        # Create a unique group name for this user
        self.room_group_name = f"chat_{self.user.id}"
        
        # Accept the connection
        await self.accept()
        
        # Create or get chat session
        await self.create_chat_session()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'welcome',
            'message': 'Welcome to MediSwift AI Assistant! How can I help you with your healthcare needs today? You can ask me about medicines for specific symptoms like headache, fever, cold, or digestive issues.',
            'sender': 'AI Assistant',
            'is_bot': True
        }))

    async def authenticate_user(self):
        """Authenticate user from JWT token in query string"""
        try:
            # Get token from query string
            query_string = self.scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token = query_params.get('token', [None])[0]
            
            if token:
                # Verify JWT token
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                self.user = await self.get_user_by_id(user_id)
            else:
                # Fallback to scope user (session auth)
                self.user = self.scope.get("user")
                
                # For testing: create a temporary user if none exists
                if not self.user or self.user.is_anonymous:
                    self.user = await self.get_or_create_test_user()
                
        except (InvalidToken, TokenError, KeyError) as e:
            logger.error(f"Authentication failed: {e}")
            self.user = self.scope.get("user")
            
            # For testing: create a temporary user if authentication fails
            if not self.user or self.user.is_anonymous:
                self.user = await self.get_or_create_test_user()

    @database_sync_to_async
    def get_user_by_id(self, user_id):
        """Get user by ID from database"""
        try:
            from django.contrib.auth.models import User
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_or_create_test_user(self):
        """Get or create a test user for development/testing"""
        try:
            user, created = User.objects.get_or_create(
                username='anonymous_chat_user',
                defaults={
                    'email': 'anonymous@mediswift.com',
                    'first_name': 'Anonymous',
                    'last_name': 'User'
                }
            )
            return user
        except Exception as e:
            logger.error(f"Error creating test user: {e}")
            return None

    async def disconnect(self, code):
        # Leave room group if it exists
        if hasattr(self, 'room_group_name'):
            pass  # No need to leave group for simple implementation

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            try:
                text_data_json = json.loads(text_data)
                message = text_data_json['message']
                
                # Save user message to database
                await self.save_message(message, False)
                
                # Generate and send bot response (no echo needed)
                bot_response = await self.generate_bot_response(message)
                
                # Save bot response to database
                await self.save_message(bot_response, True)
                
                # Send bot response
                await self.send(text_data=json.dumps({
                    'type': 'message',
                    'message': bot_response,
                    'sender': 'AI Assistant',
                    'is_bot': True
                }))
                
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Sorry, I encountered an error processing your message.'
                }))

    async def create_chat_session(self):
        """Create or get chat session for the user"""
        await self.get_or_create_chat_session()

    @database_sync_to_async
    def get_or_create_chat_session(self):
        """Get or create chat session in database"""
        try:
            session, created = ChatSession.objects.get_or_create(
                user=self.user,
                is_active=True,
                defaults={'is_active': True}
            )
            return session
        except Exception as e:
            logger.error(f"Error creating chat session: {e}")
            return None

    async def save_message(self, message, is_bot_response):
        """Save message to database"""
        await self.create_message(message, is_bot_response)

    @database_sync_to_async
    def create_message(self, message, is_bot_response):
        """Create message in database"""
        try:
            return ChatMessage.objects.create(
                sender=self.user,
                message=message,
                is_bot_response=is_bot_response
            )
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            return None

    async def generate_bot_response(self, user_message):
        """
        Generate a response from the AI assistant with enhanced medicine knowledge.
        """
        user_message_lower = user_message.lower()
        
        # Check for symptom-related queries
        for symptom, keywords in SYMPTOM_KEYWORDS.items():
            if any(keyword in user_message_lower for keyword in keywords):
                return self.generate_medicine_response(symptom)
        
        # Check for specific medicine inquiries
        if 'paracetamol' in user_message_lower or 'acetaminophen' in user_message_lower:
            return ("Paracetamol (also known as Acetaminophen) is a common pain reliever and fever reducer. "
                   "It's generally safe when used as directed. Typical adult dosage is 500-1000mg every 4-6 hours, "
                   "not exceeding 4000mg in 24 hours. Always follow package instructions or consult a healthcare provider.\n\n"
                   "Available in our store:\n"
                   "- Paracetamol 500mg (10 tablets) - ₹12-15")
        
        if 'ibuprofen' in user_message_lower:
            return ("Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used for pain, fever, and inflammation. "
                   "Typical adult dosage is 200-400mg every 4-6 hours. It should be taken with food to reduce stomach irritation. "
                   "People with heart, kidney, or stomach conditions should consult a doctor before use.\n\n"
                   "Available in our store:\n"
                   "- Ibuprofen 200mg (10 tablets) - ₹15-20")
        
        if 'antibiotic' in user_message_lower or 'antibiotics' in user_message_lower:
            return ("Antibiotics are medications used to treat bacterial infections. They are not effective against viral infections "
                   "like the common cold or flu. It's important to take antibiotics exactly as prescribed and to complete the full course, "
                   "even if you start feeling better. Misuse of antibiotics can lead to resistance.\n\n"
                   "Important: Antibiotics require a prescription. Please consult with a healthcare provider for proper diagnosis and treatment.")
        
        if 'omeprazole' in user_message_lower or 'pantoprazole' in user_message_lower:
            return ("These are proton pump inhibitors (PPIs) used to reduce stomach acid production. They're commonly prescribed for "
                   "acid reflux, heartburn, and stomach ulcers. They should be taken 30 minutes before meals for best effect.\n\n"
                   "Available in our store:\n"
                   "- Omeprazole 20mg (10 capsules) - ₹15-18\n"
                   "- Pantoprazole 40mg (10 tablets) - ₹30-35")
        
        # General healthcare conversation
        if 'hello' in user_message_lower or 'hi' in user_message_lower:
            return "Hello! I'm your MediSwift AI Assistant. How can I help you with your healthcare needs today? You can ask me about medicines for specific symptoms like headache, fever, or cold."
        elif 'medicine' in user_message_lower:
            return "I can help you find information about medicines. You can ask about specific medications, their uses, or medicines for particular symptoms like headache, fever, or cold. What would you like to know?"
        elif 'doctor' in user_message_lower:
            return "I can help you find doctors in our network. You can search by specialty, location, or name. Would you like me to help you find a doctor?"
        elif 'appointment' in user_message_lower:
            return "You can book appointments through our platform. Would you like me to guide you through the process?"
        elif 'prescription' in user_message_lower:
            return "I can provide general information about prescriptions, but for specific medical advice, please consult with a healthcare professional."
        elif 'emergency' in user_message_lower:
            return "If this is a medical emergency, please call 911 or your local emergency number immediately. For non-emergency medical concerns, I'm here to help."
        elif 'thank' in user_message_lower:
            return "You're welcome! Is there anything else I can assist you with today?"
        else:
            # Default response for unrecognized queries
            return "I'm here to help with your healthcare needs. You can ask me about medicines for specific symptoms like headache, fever, cold, or digestive issues. What would you like to know?"

    def generate_medicine_response(self, symptom):
        """
        Generate a detailed response for medicine-related queries based on symptoms.
        """
        if symptom in MEDICINE_KNOWLEDGE:
            info = MEDICINE_KNOWLEDGE[symptom]
            response = f"For {symptom.replace('-', ' ')} related issues, here's some information:\n\n{info['info']}\n\n"
            
            if info['common_medicines']:
                response += "Commonly used medicines include:\n"
                for i, med in enumerate(info['common_medicines'], 1):
                    response += f"{i}. {med['name']} - {med['use']} (Typical dosage: {med['dosage']}, Price: {med['price']})\n"
            
            response += "\nRemember: This information is for educational purposes only. Always read the package insert and consult with a healthcare professional before taking any medication. For prescription medications, please consult with a doctor."
            return response
        else:
            return f"I can provide information about medicines for {symptom.replace('-', ' ')}. However, I don't have specific details in my database. For accurate information, please consult with a healthcare professional or browse our medicine catalog."