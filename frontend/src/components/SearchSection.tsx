import React, { useState, useEffect } from 'react';

interface SearchSectionProps {
  onSearch: (query: string) => void;
  initialQuery: string;
  showFullSearch: boolean;
  darkMode: boolean;
}

const EXAMPLE_QUESTIONS = [
  "What were the findings of the Protected TAVR trial for cerebral embolic protection?",
  "How do GLP-1 agonists compare to bariatric surgery for weight loss?",
  "What is the efficacy of pembrolizumab for melanoma?",
  "Latest advances in CRISPR gene therapy for sickle cell disease"
];

const SearchSection: React.FC<SearchSectionProps> = ({ 
  onSearch, 
  initialQuery,
  showFullSearch,
  darkMode
}) => {
  const [query, setQuery] = useState(initialQuery);
  
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };
  
  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };
  
  return (
    <section className={`transition-all duration-300 ease-in-out ${showFullSearch ? 'py-16' : 'py-4'}`}>
      <div className={`max-w-3xl mx-auto ${showFullSearch ? 'text-center' : ''}`}>
        {showFullSearch && (
          <div className="mb-10">
            <h2 className={`text-4xl font-bold mb-3 tracking-tight ${darkMode ? 'text-white' : 'text-indigo-900'}`}>
              AskMedicine
            </h2>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className={`flex shadow-lg rounded-xl overflow-hidden border ${
            darkMode ? 'bg-gray-800 border-indigo-700' : 'bg-white border-indigo-200'
          }`}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a medical research question..."
              className={`flex-1 px-6 py-4 focus:outline-none w-full text-lg ${
                darkMode ? 'bg-gray-800 text-gray-100 placeholder-gray-400' : 'text-gray-800 bg-white'
              }`}
              autoFocus={showFullSearch}
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-4 hover:bg-indigo-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </form>
        
        {showFullSearch && (
          <div className="mt-6">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-indigo-500'} mb-3`}>Try asking about:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_QUESTIONS.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition shadow-sm ${
                    darkMode 
                      ? 'bg-indigo-900 text-indigo-100 border-indigo-700 hover:bg-indigo-800' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  {example.length > 35 ? example.substring(0, 33) + '...' : example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchSection; 