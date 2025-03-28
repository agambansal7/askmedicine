import os
import json
import time
from functools import lru_cache
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from medinquire import generate_direct_answer, generate_streaming_answer
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, 
            static_folder='medinquire_static',
            static_url_path='/static')
# Enable CORS for our React frontend with additional configuration options
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
app.secret_key = os.urandom(24)

# Ensure session history is initialized
HISTORY = []

# Get API key from environment variable or use the hardcoded one
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY') or "sk-ccfc35d1bf204ca88c2ad5f3e576f6c7"

# Cache for storing responses
response_cache = {}

# Cache for common medical questions
@lru_cache(maxsize=50)
def cached_answer(question):
    """Cache answers to common medical questions"""
    return generate_direct_answer(question)

@app.route('/')
def index():
    """Root endpoint - returns API information"""
    return jsonify({
        'name': 'AskMedicine API',
        'version': '1.0',
        'status': 'running',
        'endpoints': {
            '/api/query': 'POST - Submit a medical query',
            '/api/health': 'GET - Check API health',
            '/api/history': 'GET - Get query history, DELETE - Clear history'
        }
    })

@app.route('/api/query', methods=['POST'])
def query():
    try:
        data = request.get_json()
        query_text = data.get('query')
        
        if not query_text:
            return jsonify({'error': 'No query provided'}), 400

        # Check cache first
        if query_text in response_cache:
            return jsonify(response_cache[query_text])

        # Prepare the request to DeepSeek API
        headers = {
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
            'Content-Type': 'application/json'
        }

        # Print API key for debugging (first 5 chars only for security)
        api_key_prefix = DEEPSEEK_API_KEY[:5] if DEEPSEEK_API_KEY else "None"
        print(f"Using DeepSeek API key prefix: {api_key_prefix}...")

        payload = {
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a helpful medical research assistant. Provide evidence-based answers with citations from medical literature.'
                },
                {
                    'role': 'user',
                    'content': query_text
                }
            ],
            'stream': True
        }

        # Make request to DeepSeek API
        try:
            response = requests.post(
                'https://api.deepseek.com/v1/chat/completions',
                headers=headers,
                json=payload,
                stream=True
            )
            
            print(f"DeepSeek API response status: {response.status_code}")
            
            if response.status_code != 200:
                error_content = response.text
                print(f"DeepSeek API error response: {error_content}")
                return jsonify({'error': f'Failed to get response from DeepSeek API: {error_content}'}), 500
                
        except Exception as api_error:
            print(f"Error making request to DeepSeek API: {api_error}")
            return jsonify({'error': f'Error connecting to DeepSeek API: {str(api_error)}'}), 500

        def generate():
            full_response = ""
            for line in response.iter_lines():
                if line:
                    try:
                        line = line.decode('utf-8')
                        if line.startswith('data: '):
                            line = line[6:]
                            if line.strip() == '[DONE]':
                                break
                            data = json.loads(line)
                            if 'choices' in data and len(data['choices']) > 0:
                                content = data['choices'][0].get('delta', {}).get('content', '')
                                if content:
                                    full_response += content
                                    yield f"data: {json.dumps({'content': content})}\n\n"
                    except Exception as e:
                        print(f"Error processing line: {e}")
                        continue

            # Cache the complete response
            response_cache[query_text] = {'content': full_response}

        return Response(stream_with_context(generate()), mimetype='text/event-stream')

    except Exception as e:
        print(f"Error in query endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/query-alt', methods=['POST'])
def query_alternative():
    """Alternative query endpoint using a simplified mock response"""
    try:
        data = request.get_json()
        query_text = data.get('query')
        
        if not query_text:
            return jsonify({'error': 'No query provided'}), 400

        # For testing purposes, return a mock response
        def generate_mock():
            responses = [
                "Analyzing your medical query...\n\n",
                "Based on medical literature, ",
                "I can provide the following information about your question:\n\n",
                f"You asked: {query_text}\n\n",
                "This is a test response from AskMedicine's alternative endpoint. ",
                "The main endpoint is currently being updated. ",
                "Please check back shortly for full functionality with DeepSeek API integration."
            ]
            
            full_response = ""
            for chunk in responses:
                full_response += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"
                time.sleep(0.5)  # Simulate streaming delay
                
            # Cache the complete response
            response_cache[query_text] = {'content': full_response}
                
        return Response(stream_with_context(generate_mock()), mimetype='text/event-stream')
        
    except Exception as e:
        print(f"Error in alternative query endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'AskMedicine API is running',
        'features': [
            'Evidence-based medical answers',
            'Streaming responses',
            'Response caching',
            'Tabular comparison for treatment options',
            'Follow-up question generation'
        ]
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get question history"""
    return jsonify({'history': HISTORY})

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    """Clear question history"""
    global HISTORY
    HISTORY = []
    return jsonify({'message': 'History cleared'})

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'medinquire_static', 'images'), 
                               'logo.svg', mimetype='image/svg+xml')

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Run AskMedicine Web Server')
    parser.add_argument('--port', type=int, default=8086, help='Port to run the server on')
    args = parser.parse_args()
    
    print(f"Starting AskMedicine Web Server on http://0.0.0.0:{args.port}")
    app.run(host='0.0.0.0', port=args.port, debug=True) 