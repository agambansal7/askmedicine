import React from 'react';

interface FooterProps {
  darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className={`${darkMode ? 'bg-indigo-900 border-indigo-800 text-gray-400' : 'bg-indigo-50 border-indigo-100 text-indigo-500'} border-t py-6 mt-10`}>
      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} AskMedicine | AI-powered medical research assistant</p>
        <div className="mt-2 flex justify-center gap-6">
          <a href="#" className={`${darkMode ? 'hover:text-indigo-300' : 'hover:text-indigo-700'} transition`}>About</a>
          <a href="#" className={`${darkMode ? 'hover:text-indigo-300' : 'hover:text-indigo-700'} transition`}>Privacy Policy</a>
          <a href="#" className={`${darkMode ? 'hover:text-indigo-300' : 'hover:text-indigo-700'} transition`}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 