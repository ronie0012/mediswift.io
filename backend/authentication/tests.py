from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status


class AuthenticationTests(APITestCase):
    def setUp(self):
        # Create a test user
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # URLs
        self.register_url = reverse('register')
        self.token_url = reverse('token_obtain_pair')
        self.me_url = reverse('user-detail')
        self.change_password_url = reverse('change-password')
        
    def test_register_user(self):
        """
        Test that we can register a new user
        """
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'strongPassword123!',
            'password2': 'strongPassword123!',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('tokens' in response.data)
        self.assertTrue('user' in response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')
        
        # Check that the user was created
        self.assertTrue(User.objects.filter(username='newuser').exists())
    
    def test_login_user(self):
        """
        Test that a user can log in and get tokens
        """
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        
        response = self.client.post(self.token_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)
        self.assertTrue('user' in response.data)
        
        # Test accessing protected endpoint with token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['username'], 'testuser')
    
    def test_change_password(self):
        """
        Test that a user can change their password
        """
        # Login first
        login_data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = self.client.post(self.token_url, login_data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        
        # Change password
        password_data = {
            'old_password': 'testpassword123',
            'new_password': 'newPassword456!',
            'new_password2': 'newPassword456!'
        }
        
        change_response = self.client.put(self.change_password_url, password_data, format='json')
        self.assertEqual(change_response.status_code, status.HTTP_200_OK)
        
        # Verify we can login with new password
        login_data = {
            'username': 'testuser',
            'password': 'newPassword456!'
        }
        new_login_response = self.client.post(self.token_url, login_data, format='json')
        self.assertEqual(new_login_response.status_code, status.HTTP_200_OK)
