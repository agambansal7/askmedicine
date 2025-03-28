import React from 'react';

interface HeaderProps {
  onHistoryClick: () => void;
  onClearClick: () => void;
  onAboutClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onHistoryClick, 
  onClearClick, 
  onAboutClick,
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <header className={`${darkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-800'} shadow-sm sticky top-0 z-10`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
        <div className="flex items-center gap-3">
          <img src="/images/logo.svg" alt="AskMedicine Logo" className="h-10 w-10" />
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-indigo-800'}`}>AskMedicine</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onToggleDarkMode}
            className={`btn btn-small flex items-center gap-1 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
            aria-label="Toggle dark mode"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={onAboutClick}
            className={`btn btn-small flex items-center gap-1 ${darkMode ? 'bg-indigo-800 text-white hover:bg-indigo-700' : 'bg-indigo-200 text-indigo-700 hover:bg-indigo-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            About
          </button>
          
          <button
            onClick={onHistoryClick}
            className={`btn btn-small flex items-center gap-1 ${darkMode ? 'bg-indigo-800 text-white hover:bg-indigo-700' : 'bg-indigo-200 text-indigo-700 hover:bg-indigo-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
          
          <button
            onClick={onClearClick}
            className={`btn btn-small flex items-center gap-1 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 