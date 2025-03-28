import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import HistoryModal from './components/HistoryModal';
import AboutModal from './components/AboutModal';
import { SearchResult, HistoryItem } from './types';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Initialize dark mode based on user preference
  useEffect(() => {
    // Check if the user has already set a preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else {
      // If no preference, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);
  
  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  
  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (window.eventSource) {
        window.eventSource.close();
      }
    };
  }, []);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setIsStreaming(false);
    setStreamingAnswer('');
    
    // Create a temporary result object to show immediate feedback
    const tempResult: SearchResult = {
      question: query,
      answer: '',
      timestamp: new Date().toISOString(),
    };
    
    setSearchResults(tempResult);
    
    try {
      // Use streaming by default for better UX
      await streamResponse(query);
    } catch (error) {
      // Fall back to regular request if streaming fails
      try {
        await fetchStandardResponse(query);
      } catch (secondError) {
        console.error('Error fetching answer:', secondError);
        setSearchResults({
          question: query,
          answer: 'Sorry, there was an error processing your question. Please try again.',
          timestamp: new Date().toISOString(),
          error: true
        });
        setIsLoading(false);
      }
    }
  };
  
  const streamResponse = async (query: string) => {
    setIsStreaming(true);
    setIsLoading(false); // Start showing content immediately when streaming
    
    // Close any existing event source
    if (window.eventSource) {
      window.eventSource.close();
    }
    
    // Create a new event source with a unique timestamp to prevent caching
    const timestamp = new Date().getTime();
    const eventSource = new EventSource(`/api/ask?question=${encodeURIComponent(query)}&streaming=true&_=${timestamp}`);
    window.eventSource = eventSource;
    
    let fullAnswer = '';
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // If we got the "done" message, clean up
        if (data.done) {
          eventSource.close();
          setIsStreaming(false);
          
          // Final update to the answer
          updateResult(query, fullAnswer);
          return;
        }
        
        // Otherwise, update with the new chunk
        if (data.chunk) {
          fullAnswer += data.chunk;
          setStreamingAnswer(fullAnswer);
          
          // Update the result object as we go, even while streaming
          updateResult(query, fullAnswer, true);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
      setIsStreaming(false);
      
      // If we never got any content, throw to trigger the fallback
      if (fullAnswer === '') {
        throw new Error('Streaming failed');
      }
    };
  };
  
  const fetchStandardResponse = async (query: string) => {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query, streaming: false })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch answer');
    }
    
    const data = await response.json();
    
    const result: SearchResult = {
      question: query,
      answer: data.answer,
      timestamp: new Date().toISOString(),
      cached: data.cached || false
    };
    
    setSearchResults(result);
    
    // Add to history
    const newHistory = [result, ...history].slice(0, 50); // Keep max 50 history items
    setHistory(newHistory);
    
    setIsLoading(false);
  };
  
  const updateResult = (query: string, answer: string, isStillStreaming: boolean = false) => {
    const updatedResult: SearchResult = {
      question: query,
      answer: answer,
      timestamp: new Date().toISOString(),
      streaming: isStillStreaming
    };
    
    setSearchResults(updatedResult);
    
    // Only update history when streaming is complete and it's a different question
    if (!isStillStreaming) {
      const newHistory = [updatedResult, ...history.filter(h => h.question !== query)].slice(0, 50);
      setHistory(newHistory);
    }
  };
  
  const handleFollowUpClick = (question: string) => {
    handleSearch(question);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setStreamingAnswer('');
    setIsLoading(false);
    setIsStreaming(false);
    
    // Close any active event source
    if (window.eventSource) {
      window.eventSource.close();
      window.eventSource = null;
    }
  };
  
  const clearHistory = () => {
    setHistory([]);
  };
  
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };
  
  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        onHistoryClick={toggleHistory} 
        onClearClick={clearSearch}
        onAboutClick={toggleAbout}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <main className={`flex-1 container mx-auto px-4 py-8 max-w-4xl ${darkMode ? 'text-gray-100' : ''}`}>
        <SearchSection 
          onSearch={handleSearch} 
          initialQuery={searchQuery}
          showFullSearch={!searchResults}
          darkMode={darkMode}
        />
        
        {(searchResults || isLoading) && (
          <ResultsSection 
            result={searchResults} 
            isLoading={isLoading}
            isStreaming={isStreaming}
            onNewSearch={clearSearch}
            onFollowUpClick={handleFollowUpClick}
            darkMode={darkMode}
          />
        )}
      </main>
      
      <Footer darkMode={darkMode} />
      
      <HistoryModal 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelectItem={(item) => {
          handleSearch(item.question);
          setShowHistory(false);
        }}
        onClearHistory={clearHistory}
        darkMode={darkMode}
      />

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        darkMode={darkMode}
      />
    </div>
  );
};

// Extend Window interface to add eventSource property
declare global {
  interface Window {
    eventSource: EventSource | null;
  }
}

// Initialize the global event source property
window.eventSource = null;

export default App; 