import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  darkMode: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectItem,
  onClearHistory,
  darkMode
}) => {
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

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <div className={`transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={darkMode ? 'bg-gray-800 px-4 pt-5 pb-4' : 'bg-white px-4 pt-5 pb-4'}>
                <div className={`flex items-center justify-between pb-3 border-b ${darkMode ? 'border-indigo-700' : 'border-indigo-200'}`}>
                  <Dialog.Title className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-indigo-900'}`}>
                    Search History
                  </Dialog.Title>
                  <button
                    type="button"
                    className={`rounded-md ${darkMode ? 'bg-gray-800 text-gray-400 hover:text-gray-300' : 'bg-white text-gray-400 hover:text-gray-500'} focus:outline-none`}
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 max-h-80 overflow-y-auto">
                  {history.length === 0 ? (
                    <div className={`py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>No search history yet.</p>
                    </div>
                  ) : (
                    <ul className={`divide-y ${darkMode ? 'divide-indigo-700' : 'divide-indigo-100'}`}>
                      {history.map((item, index) => (
                        <li 
                          key={index}
                          className={`py-4 px-2 cursor-pointer transition rounded-md ${
                            darkMode 
                              ? 'hover:bg-indigo-900' 
                              : 'hover:bg-indigo-50'
                          }`}
                          onClick={() => onSelectItem(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="overflow-hidden">
                              <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {item.question}
                              </p>
                              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(item.timestamp)}
                                {item.cached && (
                                  <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded-full">
                                    Cached
                                  </span>
                                )}
                              </p>
                            </div>
                            <svg className={`h-5 w-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className={`px-4 py-3 flex justify-end ${darkMode ? 'bg-gray-900' : 'bg-indigo-50'}`}>
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                  onClick={onClearHistory}
                >
                  Clear History
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default HistoryModal; 