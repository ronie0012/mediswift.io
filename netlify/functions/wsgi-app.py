import os
import sys
import json
import base64
from io import StringIO

# Set up paths
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(current_dir, '..', '..')
backend_dir = os.path.join(project_root, 'backend')
sys.path.append(backend_dir)

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.netlify_settings')

# Import Django and set up application
from django.core.wsgi import get_wsgi_application
from django.test.client import RequestFactory
from django.http import HttpResponse
from django.urls import resolve

# Initialize Django
application = get_wsgi_application()

class ResponseWrapper:
    def __init__(self, response):
        self.response = response
        self.status_code = response.status_code
        self.headers = dict(response.headers)
        
        # Capture the content
        self.content = response.content.decode('utf-8') if hasattr(response, 'content') else ''

    def to_json(self):
        return json.dumps({
            'statusCode': self.status_code,
            'headers': self.headers,
            'body': self.content
        })

def handle_request(event):
    # Extract details from the event
    http_method = os.environ.get('HTTP_METHOD', 'GET')
    path = os.environ.get('HTTP_PATH', '/')
    query_string = os.environ.get('QUERY_STRING', '')
    
    # Remove the /api prefix if needed
    if path.startswith('/api/'):
        path = path[4:]
    
    # Get request body if it exists
    body_content = sys.stdin.read() if not sys.stdin.isatty() else None
    
    # Create a fake request
    factory = RequestFactory()
    
    # Build the proper URL with query params
    full_path = path
    if query_string:
        full_path = f"{path}?{query_string}"
    
    # Create the request based on the method
    if http_method == 'GET':
        request = factory.get(full_path)
    elif http_method == 'POST':
        request = factory.post(full_path, data=body_content, content_type='application/json')
    elif http_method == 'PUT':
        request = factory.put(full_path, data=body_content, content_type='application/json')
    elif http_method == 'DELETE':
        request = factory.delete(full_path)
    elif http_method == 'PATCH':
        request = factory.patch(full_path, data=body_content, content_type='application/json')
    else:
        request = factory.get(full_path)
    
    # Resolve the URL to get the view function
    resolver_match = resolve(path)
    view_func = resolver_match.func
    
    # Call the view with the request
    response = view_func(request, *resolver_match.args, **resolver_match.kwargs)
    
    # Wrap and return the response
    wrapped_response = ResponseWrapper(response)
    return wrapped_response.to_json()

# Main handler
def handler(event, context):
    """Handler for the Netlify function"""
    try:
        response_json = handle_request(event)
        print(response_json)
        return response_json
    except Exception as e:
        error_response = {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
        print(json.dumps(error_response))
        return json.dumps(error_response)

# If running directly, handle stdin as event
if __name__ == "__main__":
    # For local testing or when invoked by the js handler
    event = {}
    handler(event, None) 