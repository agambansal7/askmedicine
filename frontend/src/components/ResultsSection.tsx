import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SearchResult } from '../types';

interface ResultsSectionProps {
  result: SearchResult | null;
  isLoading: boolean;
  isStreaming: boolean;
  onNewSearch: () => void;
  onFollowUpClick: (question: string) => void;
  darkMode: boolean;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  result, 
  isLoading,
  isStreaming,
  onNewSearch,
  onFollowUpClick,
  darkMode
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [formattedAnswer, setFormattedAnswer] = useState('');
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copySuccess) {
      timer = setTimeout(() => setCopySuccess(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [copySuccess]);
  
  useEffect(() => {
    if (result?.answer) {
      const { cleanedAnswer, extractedQuestions } = extractFollowUpQuestions(result.answer);
      setFormattedAnswer(cleanedAnswer);
      setFollowUpQuestions(extractedQuestions);
    } else {
      setFormattedAnswer('');
      setFollowUpQuestions([]);
    }
  }, [result]);
  
  const extractFollowUpQuestions = (text: string) => {
    // Look for follow-up questions section at the end of the answer
    const followUpPattern = /(related:|follow-up questions:|follow up questions:)([\s\S]*?)$/i;
    const match = text.match(followUpPattern);
    
    if (match) {
      // Extract the questions section
      const questionsSection = match[2];
      
      // Extract the questions from the section - handling both numbered and asterisk formats
      const questionsPattern = /(?:\d+\.|[\*\-•])\s+(.*?)(?=\n(?:\d+\.|[\*\-•])|\n*$)/gs;
      const questionsMatches = [...questionsSection.matchAll(questionsPattern)];
      
      const extractedQuestions = questionsMatches
        .map(m => m[1].trim())
        .filter(q => q) // Remove empty questions
        .map(q => {
          // Remove any trailing question marks if already present
          if (q.endsWith('?')) {
            return q;
          }
          return q + '?';
        });
      
      // Remove the follow-up questions section from the answer
      const cleanedAnswer = text.replace(followUpPattern, '').trim();
      
      return { cleanedAnswer, extractedQuestions };
    }
    
    // If no follow-up questions found
    return { cleanedAnswer: text, extractedQuestions: [] };
  };
  
  const copyToClipboard = async () => {
    if (result?.answer) {
      await navigator.clipboard.writeText(result.answer);
      setCopySuccess(true);
    }
  };
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return '';
    }
  };
  
  // Function to add section-based styling
  const enhanceMarkdown = (markdown: string) => {
    // Add proper headings and formatting to make the content more readable
    let enhancedMarkdown = markdown;
    
    // Ensure headers have proper markdown formatting (###)
    enhancedMarkdown = enhancedMarkdown.replace(/\n([A-Z][A-Za-z\s]+):/g, '\n### $1:');
    
    // Make statistical values bold
    enhancedMarkdown = enhancedMarkdown.replace(
      /(\b\d+(\.\d+)?%|\b\d+\.\d+\b|\bp\s*[<>=]\s*\d+(\.\d+)?)/g, 
      '**$1**'
    );
    
    // Bold clinical trials, guidelines and important medical terms
    enhancedMarkdown = enhancedMarkdown.replace(
      /\b([A-Z]{2,}(?:-[A-Z]+)*)\b(?!\s*\])/g, 
      '**$1**'
    ); // Bold trial names like SPRINT, ONTARGET
    
    enhancedMarkdown = enhancedMarkdown.replace(
      /\b((?:[A-Z][a-z]*\/)*[A-Z][a-z]*\sGuidelines?)\b/g, 
      '***$1***'
    ); // Italicize and bold guidelines 
    
    // Improve list formatting - ensure proper spacing for bullet points
    enhancedMarkdown = enhancedMarkdown.replace(/^\s*[-\*•]\s+/gm, '- ');
    enhancedMarkdown = enhancedMarkdown.replace(/^\s*(\d+)\.\s+/gm, '$1. ');
    
    return enhancedMarkdown;
  };
  
  return (
    <section className="mt-6 animate-fade-in">
      <div className={`${darkMode ? 'bg-gray-800 border-indigo-700' : 'bg-white border-indigo-200'} rounded-xl shadow-md overflow-hidden border`}>
        {/* Header with question and actions */}
        <div className={`${darkMode ? 'border-indigo-700' : 'border-indigo-200'} border-b px-6 py-4 flex justify-between items-start`}>
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-indigo-900'} mb-1`}>
              {result?.question || 'Loading...'}
            </h3>
            {result?.timestamp && (
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(result.timestamp)}
                {result.cached && (
                  <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                    Cached
                  </span>
                )}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className={`btn btn-small ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'} flex items-center gap-1`}
              disabled={isLoading || !result}
            >
              {copySuccess ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-600">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.612-8.073-8.073-8.073S3 6.79 3 11.25v4.875c0 .621.504 1.125 1.125 1.125h3.375m7.5 0v-9.375c0-.621-.504-1.125-1.125-1.125h-1.5m1.5 3.75v-1.5m1.5 1.5v-1.5m1.5 1.5v-1.5" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            
            <button
              onClick={onNewSearch}
              className={`btn btn-small ${darkMode ? 'bg-indigo-800 text-white hover:bg-indigo-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'} flex items-center gap-1`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              New Search
            </button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className={`w-12 h-12 border-4 ${darkMode ? 'border-gray-700 border-t-indigo-400' : 'border-gray-200 border-t-indigo-600'} rounded-full animate-spin mb-4`}></div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Searching medical literature...</p>
            </div>
          ) : result?.error ? (
            <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-500 text-red-700'} border-l-4 p-4 mb-4`}>
              <p>{result.answer}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Streaming indicator */}
              {isStreaming && (
                <div className="flex items-center text-gray-500 mb-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Generating response...</span>
                </div>
              )}
              
              {/* Main answer section */}
              <div className={`prose prose-lg ${darkMode ? 'prose-invert' : 'prose-indigo'} max-w-none`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  components={{
                    h3: ({node, ...props}) => <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mt-6 mb-3`} {...props} />,
                    h4: ({node, ...props}) => <h4 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mt-5 mb-2`} {...props} />,
                    p: ({node, ...props}) => <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`} {...props} />,
                    ul: ({node, ...props}) => <ul className="mb-4 pl-6 list-disc space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="mb-4 pl-6 list-decimal space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className={`border-l-4 ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'} pl-4 italic`} {...props} />,
                    hr: ({node, ...props}) => <hr className={`my-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} {...props} />,
                    table: ({node, ...props}) => <table className={`border-collapse table-auto w-full ${darkMode ? 'border-gray-700' : 'border-gray-300'} my-4`} {...props} />,
                    thead: ({node, ...props}) => <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'} {...props} />,
                    tbody: ({node, ...props}) => <tbody {...props} />,
                    tr: ({node, ...props}) => <tr className={`${darkMode ? 'border-gray-700' : 'border-gray-300'} border-b`} {...props} />,
                    th: ({node, ...props}) => <th className={`${darkMode ? 'border-gray-700' : 'border-gray-300'} border px-4 py-2 text-left`} {...props} />,
                    td: ({node, ...props}) => <td className={`${darkMode ? 'border-gray-700' : 'border-gray-300'} border px-4 py-2`} {...props} />,
                    a: ({node, href, children, ...props}) => (
                      <a 
                        href={href} 
                        className={`${darkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'} underline`}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {formattedAnswer ? enhanceMarkdown(formattedAnswer) : ''}
                </ReactMarkdown>
              </div>
              
              {/* Follow-up questions section */}
              {followUpQuestions.length > 0 && (
                <div className={`mt-2 pt-4 ${darkMode ? 'border-indigo-800' : 'border-indigo-100'} border-t`}>
                  <h4 className={`text-base font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'} mb-3`}>Related</h4>
                  <div className="flex flex-wrap gap-2">
                    {followUpQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => onFollowUpClick(question)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium border ${
                          darkMode 
                            ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800 border-indigo-700' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                        }`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-indigo-600'} mb-2`}>
                      Ask a follow-up question:
                    </p>
                    <form 
                      className="flex"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.querySelector('input');
                        if (input && input.value.trim()) {
                          onFollowUpClick(input.value.trim());
                          input.value = '';
                        }
                      }}
                    >
                      <input 
                        type="text" 
                        placeholder="Type your question here..." 
                        className={`flex-1 px-3 py-2 text-sm rounded-l-lg focus:outline-none border ${
                          darkMode 
                            ? 'bg-gray-700 border-indigo-700 text-gray-200 placeholder-gray-400' 
                            : 'bg-white border-indigo-300 text-gray-700 placeholder-gray-500'
                        }`}
                      />
                      <button 
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        Ask
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection; 