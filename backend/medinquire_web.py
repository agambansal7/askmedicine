import os
import json
import time
from functools import lru_cache
from flask import Flask, render_template, request, jsonify, send_from_directory, url_for, Response, stream_with_context
from flask_cors import CORS
from medinquire import generate_direct_answer, generate_streaming_answer

app = Flask(__name__, 
            static_folder='medinquire_static',
            static_url_path='/static')
# Enable CORS for our React frontend with additional configuration options
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
app.secret_key = os.urandom(24)

# Ensure session history is initialized
HISTORY = []

# Cache for common medical questions
@lru_cache(maxsize=50)
def cached_answer(question):
    """Cache answers to common medical questions"""
    return generate_direct_answer(question)

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('medinquire.html')

@app.route('/api/ask', methods=['POST', 'GET'])
def ask():
    """Process a medical question and return an answer"""
    # For GET requests (used by streaming EventSource)
    if request.method == 'GET':
        question = request.args.get('question')
        streaming = request.args.get('streaming') == 'true'
    # For POST requests (used by standard fetch)
    else:
        data = request.get_json()
        question = data.get('question')
        streaming = data.get('streaming', True)  # Enable streaming by default
    
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    
    try:
        # Add to history immediately
        timestamp = time.time()
        history_item = {
            'question': question,
            'timestamp': timestamp
        }
        
        if streaming:
            # For streaming responses, return a streaming response
            def generate():
                try:
                    answer_stream = generate_streaming_answer(question)
                    full_answer = ""
                    
                    # Send initial empty message to establish connection
                    yield f"data: {json.dumps({'chunk': ''})}\n\n"
                    
                    # Send smaller chunks more frequently for better streaming
                    for chunk in answer_stream:
                        if isinstance(chunk, str) and chunk:
                            full_answer += chunk
                            # Send each chunk immediately
                            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                    
                    # Update history with complete answer
                    history_item['answer'] = full_answer
                    HISTORY.append(history_item)
                    
                    # Send end event
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    
                except Exception as e:
                    print(f"Error in streaming response: {str(e)}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    yield f"data: {json.dumps({'done': True})}\n\n"
                
            return Response(stream_with_context(generate()), 
                           mimetype='text/event-stream',
                           headers={
                               'Cache-Control': 'no-cache, no-transform',
                               'X-Accel-Buffering': 'no',
                               'Content-Encoding': 'identity',
                               'Connection': 'keep-alive',
                               'Access-Control-Allow-Origin': '*',
                               'Access-Control-Allow-Headers': 'Content-Type',
                               'Transfer-Encoding': 'chunked'
                           })
        else:
            # Check if the question has been cached
            try:
                # First look in history
                for item in HISTORY:
                    if item['question'].lower() == question.lower() and 'answer' in item:
                        return jsonify({'answer': item['answer'], 'cached': True})
                
                # Then try the cache
                answer = cached_answer(question)
                history_item['answer'] = answer
                HISTORY.append(history_item)
                return jsonify({'answer': answer})
            except Exception as inner_e:
                print(f"Cache miss, generating new answer: {str(inner_e)}")
                answer = generate_direct_answer(question)
                history_item['answer'] = answer
                HISTORY.append(history_item)
                return jsonify({'answer': answer})
    except Exception as e:
        print(f"Error generating answer: {str(e)}")
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