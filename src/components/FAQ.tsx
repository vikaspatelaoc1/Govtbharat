import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "How often are the job listings updated?",
    answer: "We update our portal daily with the latest government job notifications, admit cards, and results directly from official sources to ensure you never miss an opportunity."
  },
  {
    question: "Is it free to use this portal?",
    answer: "Yes, browsing notifications and accessing all information on GovtBharat is completely free for all students and aspirants."
  },
  {
    question: "How can I get instant alerts for new jobs?",
    answer: "You can subscribe to our email notifications using the 'Subscribe' button below, or join our official Telegram and WhatsApp groups via the links in the top navigation bar."
  },
  {
    question: "Are the links provided for application official?",
    answer: "Yes, we always provide direct, verified links to the official government websites for applying to jobs, downloading admit cards, or checking results."
  },
  {
    question: "What should I do if an application link is not working?",
    answer: "Sometimes official government websites experience heavy traffic and go down temporarily. Please try again after some time. If the issue persists, you can contact us to report the broken link."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 mt-4 border-t border-slate-200 dark:border-slate-800 mr-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Common queries about government job updates and our portal</p>
        </div>
      </div>
      
      <div className="flex flex-col items-start gap-2.5">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`border transition-all duration-200 rounded-xl overflow-hidden w-fit max-w-full ${isOpen ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/50 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="text-left px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 focus:outline-none cursor-pointer w-full"
              >
                <span className={`font-bold text-sm sm:text-base ${isOpen ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>
                  {faq.question}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 hidden'}`}
              >
                <div className="px-3.5 pb-3 sm:px-4 sm:pb-3.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-[600px]">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
