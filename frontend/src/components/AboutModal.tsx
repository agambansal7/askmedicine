import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, darkMode }) => {
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
            <div className={`transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-2xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <div className={`flex items-center justify-between pb-4 border-b ${darkMode ? 'border-indigo-700' : 'border-indigo-200'}`}>
                  <Dialog.Title className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>
                    About AskMedicine
                  </Dialog.Title>
                  <button
                    type="button"
                    className={`rounded-md ${darkMode ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-white text-gray-400 hover:text-gray-500'} focus:outline-none`}
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-4`}>
                  <p>
                    <span className={`font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>AskMedicine</span> is an advanced research assistant designed to provide evidence-based answers to medical questions.
                  </p>
                  
                  <h3 className={`text-lg font-semibold mt-6 ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>What makes AskMedicine unique:</h3>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Deep Medical Knowledge Base</span>: Our systems search across millions of peer-reviewed medical articles from leading journals to provide accurate information.
                    </li>
                    <li>
                      <span className="font-medium">Evidence-Based Approach</span>: All answers are grounded in published medical research, with key statistics and data points included when available.
                    </li>
                    <li>
                      <span className="font-medium">Clear Formatting</span>: Complex medical information is presented in an organized, easy-to-read format with proper headings and structured content.
                    </li>
                    <li>
                      <span className="font-medium">Follow-up Questions</span>: Each answer suggests relevant follow-up questions to help you explore topics in greater depth.
                    </li>
                    <li>
                      <span className="font-medium">Table Comparisons</span>: When comparing treatments or approaches, data is presented in clear tables for easier understanding.
                    </li>
                  </ul>
                  
                  <h3 className={`text-lg font-semibold mt-6 ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>How to use AskMedicine:</h3>
                  
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Enter a specific medical question in the search bar.
                    </li>
                    <li>
                      Review the evidence-based answer with citations from medical literature.
                    </li>
                    <li>
                      Click on any follow-up question to dive deeper into related topics.
                    </li>
                    <li>
                      Use the "History" button to revisit your previous searches.
                    </li>
                  </ol>
                  
                  <div className={`${darkMode ? 'bg-indigo-900' : 'bg-indigo-50'} p-4 rounded-lg mt-6`}>
                    <p className={`text-sm ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                      <span className="font-bold">Note:</span> AskMedicine provides general medical information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-6 py-4 flex justify-end`}>
                <button
                  type="button"
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium`}
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AboutModal; 