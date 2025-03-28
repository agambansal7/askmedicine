import os
import json
import textwrap
import re
import requests
import time
import ssl
import certifi
from urllib3.util import ssl_
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager
from urllib3.exceptions import InsecureRequestWarning
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Custom HTTPS adapter with modern SSL configuration
class TlsAdapter(HTTPAdapter):
    def init_poolmanager(self, connections, maxsize, block=False):
        """Create and initialize the urllib3 PoolManager with enhanced TLS settings."""
        ctx = ssl_.create_urllib3_context(
            ssl_version=ssl.PROTOCOL_TLS,
            cert_reqs=ssl.CERT_REQUIRED,
            options=ssl.OP_NO_SSLv2 | ssl.OP_NO_SSLv3 | ssl.OP_NO_TLSv1 | ssl.OP_NO_TLSv1_1
        )
        
        # Use the system's trusted CA certificates
        self.poolmanager = PoolManager(
            num_pools=connections,
            maxsize=maxsize,
            block=block,
            ssl_context=ctx,
            cert_reqs=ssl.CERT_REQUIRED,
            ca_certs=certifi.where()
        )

# Create a session with appropriate TLS settings
def create_secure_session():
    session = requests.Session()
    adapter = TlsAdapter()
    session.mount('https://', adapter)
    return session

# Initialize DeepSeek API client
def get_deepseek_api_key():
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise ValueError("Missing required DeepSeek API key in .env file")
    return api_key

def generate_direct_answer(question):
    """Generate an answer directly using DeepSeek v3 API"""
    api_key = get_deepseek_api_key()
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    system_message = """You are AskMedicine, a specialized medical research assistant that provides evidence-based answers to medical questions. 
    
Your goal is to:
1. Provide accurate, up-to-date medical information based on the latest research
2. Explain medical concepts clearly and comprehensively 
3. Be honest about limitations in medical knowledge where appropriate
4. Cite specific research when possible
5. Explain the strength of evidence behind medical claims

Follow these specific formatting guidelines:
1. Always use proper Markdown formatting:
   - Make **headings bold** using the syntax "**Heading:**"
   - Format *subheadings in italics* using "*Subheading:*"
   - **Bold important medical terms, statistics, and key findings**
   - ***Bold and italicize clinical trial names and guideline recommendations***
   - Properly format tables with headers for comparisons
   
2. When citing research:
   - Include author names and year: "Smith J, et al. (2023)"
   - Keep citation style consistent throughout
   - DO NOT include PubMed IDs or hyperlinks
   
3. For step-by-step procedures, guidelines, or recommendations:
   - Present them as numbered or bulleted lists with proper indentation
   - Maintain clear headings for different sections
   - Use line breaks between sections for clarity
   - Ensure proper spacing after bullet point markers (-, *, •)
   
4. When comparing treatments, drugs, or approaches:
   - Use properly formatted markdown tables with clear headers for direct comparisons
   - Include column headers that clearly indicate what is being compared
   - Use consistent metrics across rows to facilitate comparison
   - Highlight significant differences with bold text
   - Always include a brief textual summary of the key differences before or after the table
   
5. References should be included at the end in this format: "Author Name, et al. (YEAR). Title of paper."
   
6. End each answer with "Related" followed by 3-4 specific follow-up questions that would be logical next questions. Use bullet points instead of numbers for these questions.

Format example for Related questions:
Related:
- Question one?
- Question two?
- Question three?"""
    
    url = "https://api.deepseek.com/v1/chat/completions"
    
    payload = {
        "model": "deepseek-chat", 
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": question}
        ],
        "temperature": 0.4,
        "max_tokens": 1200
    }
    
    try:
        # Use a secured session for the request
        session = create_secure_session()
        response = session.post(url, headers=headers, json=payload, timeout=45)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        response.raise_for_status()  # Raise exception for HTTP errors
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except requests.exceptions.SSLError as ssl_err:
        print(f"SSL Error connecting to DeepSeek API: {str(ssl_err)}")
        return "I apologize, but there's a secure connection issue when trying to reach the medical knowledge database. This is likely a temporary network security issue. Please try again in a few moments."
    except requests.exceptions.ConnectionError as conn_err:
        print(f"Connection Error with DeepSeek API: {str(conn_err)}")
        return "I'm having trouble connecting to the medical knowledge database. This might be due to network issues or the service may be temporarily unavailable. Please check your internet connection and try again."
    except requests.exceptions.Timeout as timeout_err:
        print(f"Timeout Error with DeepSeek API: {str(timeout_err)}")
        return "The request to the medical knowledge database timed out. The service might be experiencing high load. Please try again in a few moments."
    except Exception as e:
        print(f"Error generating answer with DeepSeek: {str(e)}")
        print(f"Request payload: {payload}")
        print(f"Request headers: {headers}")
        # Mask the actual API key in the output
        headers["Authorization"] = "Bearer [REDACTED]"
        return f"I apologize, but I'm unable to generate an answer at this time due to an error: {str(e)}"

def generate_streaming_answer(question):
    """Generate a streaming answer using DeepSeek v3 API"""
    start_time = time.time()
    api_key = get_deepseek_api_key()
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    system_message = """You are AskMedicine, a specialized medical research assistant that provides evidence-based answers to medical questions. 
    
Your goal is to:
1. Provide accurate, up-to-date medical information based on the latest research
2. Explain medical concepts clearly and comprehensively 
3. Be honest about limitations in medical knowledge where appropriate
4. Cite specific research when possible
5. Explain the strength of evidence behind medical claims

Follow these specific formatting guidelines:
1. Always use proper Markdown formatting:
   - Make **headings bold** using the syntax "**Heading:**"
   - Format *subheadings in italics* using "*Subheading:*"
   - **Bold important medical terms, statistics, and key findings**
   - ***Bold and italicize clinical trial names and guideline recommendations***
   - Properly format tables with headers for comparisons
   
2. When citing research:
   - Include author names and year: "Smith J, et al. (2023)"
   - Keep citation style consistent throughout
   - DO NOT include PubMed IDs or hyperlinks
   
3. For step-by-step procedures, guidelines, or recommendations:
   - Present them as numbered or bulleted lists with proper indentation
   - Maintain clear headings for different sections
   - Use line breaks between sections for clarity
   - Ensure proper spacing after bullet point markers (-, *, •)
   
4. When comparing treatments, drugs, or approaches:
   - Use properly formatted markdown tables with clear headers for direct comparisons
   - Include column headers that clearly indicate what is being compared
   - Use consistent metrics across rows to facilitate comparison
   - Highlight significant differences with bold text
   - Always include a brief textual summary of the key differences before or after the table
   
5. References should be included at the end in this format: "Author Name, et al. (YEAR). Title of paper."
   
6. End each answer with "Related" followed by 3-4 specific follow-up questions that would be logical next questions. Use bullet points instead of numbers for these questions.

Format example for Related questions:
Related:
- Question one?
- Question two?
- Question three?"""
    
    url = "https://api.deepseek.com/v1/chat/completions"
    
    payload = {
        "model": "deepseek-chat", 
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": question}
        ],
        "temperature": 0.3,  # Prioritizing accuracy with lower temperature
        "max_tokens": 2000,  # Keeping higher token count for more comprehensive answers
        "stream": True  # Enable streaming
    }
    
    try:
        print(f"Requesting streaming response for: '{question[:50]}...'")
        request_start = time.time()
        
        # Use a secured session for the streaming request
        session = create_secure_session()
        
        # Use stream=True in requests to get the response incrementally
        response = session.post(url, headers=headers, json=payload, stream=True, timeout=60)
        first_byte_time = time.time()
        print(f"Time to first byte: {first_byte_time - request_start:.2f} seconds")
        
        response.raise_for_status()
        
        # For collecting the complete answer
        full_answer = ""
        chunk_count = 0
        last_yield_time = time.time()
        buffer = ""  # Buffer to accumulate smaller chunks
        
        # Iterate through the streaming response
        for line in response.iter_lines():
            if line:
                # Format is "data: {json}" for SSE
                line_text = line.decode('utf-8')
                if line_text.startswith("data: "):
                    json_str = line_text[6:]  # Remove "data: " prefix
                    
                    # Skip the [DONE] message
                    if json_str.strip() == "[DONE]":
                        break
                    
                    try:
                        response_json = json.loads(json_str)
                        delta = response_json.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            chunk_count += 1
                            full_answer += content
                            
                            # Yield each piece immediately for maximum streaming speed
                            yield content
                    except json.JSONDecodeError:
                        print(f"Error decoding JSON: {json_str}")
                        continue
        
        # Yield any remaining content in the buffer
        if buffer:
            yield buffer
        
        end_time = time.time()
        total_time = end_time - start_time
        print(f"Total streaming response time: {total_time:.2f} seconds")
        print(f"Received {chunk_count} content chunks")
        
        # At the end, return the full answer for reference (though not used in streaming mode)
        return full_answer
        
    except requests.exceptions.SSLError as ssl_err:
        error_msg = "I apologize, but there's a secure connection issue when trying to reach the medical knowledge database. This is likely a temporary network security issue. Please try again in a few moments."
        print(f"SSL Error connecting to DeepSeek API: {str(ssl_err)}")
        yield error_msg
        return error_msg
    except requests.exceptions.ConnectionError as conn_err:
        error_msg = "I'm having trouble connecting to the medical knowledge database. This might be due to network issues or the service may be temporarily unavailable. Please check your internet connection and try again."
        print(f"Connection Error with DeepSeek API: {str(conn_err)}")
        yield error_msg
        return error_msg
    except requests.exceptions.Timeout as timeout_err:
        error_msg = "The request to the medical knowledge database timed out. The service might be experiencing high load. Please try again in a few moments."
        print(f"Timeout Error with DeepSeek API: {str(timeout_err)}")
        yield error_msg
        return error_msg
    except Exception as e:
        error_msg = f"I apologize, but I'm unable to generate an answer at this time due to an error: {str(e)}"
        print(f"Error generating streaming answer with DeepSeek: {str(e)}")
        yield error_msg
        return error_msg

def main():
    """Main demo function"""
    print("=== MedInquire Direct Answer Medical Assistant ===\n")
    
    # Test with questions
    test_questions = [
        "What were the findings of the Protected TAVR trial for cerebral embolic protection?",
        "Can you tell me about the Protected TAVR clinical trial?",
        "What's the relationship between diabetes and cardiovascular disease?",
        "Recent advances in CRISPR gene therapy for sickle cell disease"
    ]
    
    # Run the first question as a demo
    question = test_questions[0]
    print(f"Question: {question}\n")
    
    answer = generate_direct_answer(question)
    
    print("\n=== ANSWER ===\n")
    # Print the answer with nice wrapping
    for line in answer.split('\n'):
        if line.strip():
            wrapped = textwrap.fill(line, width=100)
            print(wrapped)
        else:
            print()

if __name__ == "__main__":
    main() 