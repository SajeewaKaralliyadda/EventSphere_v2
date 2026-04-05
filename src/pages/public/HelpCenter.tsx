import React, { useState } from 'react';
import { Search, ChevronDown, MessageCircle, FileText, LifeBuoy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import DynamicButton from '../../components/ui/DynamicButton';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  {
    category: 'For Attendees',
    questions: [
      { q: 'How do I buy a ticket?', a: 'Simply browse the events on your university portal, select the event you want to attend, choose your ticket tier, and proceed to checkout. You can pay using various supported payment methods.' },
      { q: 'Where can I find my purchased tickets?', a: 'Once purchased, your tickets are available in your Attendee Dashboard under "My Tickets". You will also receive an email confirmation with a QR code.' },
      { q: 'Can I get a refund?', a: 'Refund policies vary by event. Check the specific event details page for the organizer\'s refund policy. If eligible, you can request a refund through your Attendee Dashboard.' },
    ]
  },
  {
    category: 'For Organizers',
    questions: [
      { q: 'How do I create an event?', a: 'Log in to your Organizer Dashboard and click "Create New Event". Follow the step-by-step wizard to add event details, date, venue, and ticket tiers.' },
      { q: 'How do I scan tickets at the door?', a: 'Use the built-in QR Scanner Mobile view accessible from your Organizer Dashboard. Simply point your device camera at the attendee\'s ticket QR code.' },
      { q: 'When do I receive my payouts?', a: 'Payouts are processed by the platform administrators (Super Admin) and typically disbursed within 3-5 business days after the successful completion of your event.' },
    ]
  }
];

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState<string | null>('0-0');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <GlobalNavbar />
      
      {/* Header */}
      <div className="pt-32 pb-16 px-6 relative overflow-hidden bg-blue-600 dark:bg-blue-900 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            How can we help you?
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10">
            Search our knowledge base or browse categories below to find answers to common questions.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for articles, topics, or questions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-blue-400/50 transition-all shadow-xl text-lg"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 -mt-24">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 text-center hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Getting Started</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Basic guides for new users.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 text-center hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Account & Billing</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile and payments.</p>
          </div>
          <div 
            onClick={() => navigate('/contact')}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 text-center hover:-translate-y-1 transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Contact Support</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Get in touch with our team.</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-12">
          {FAQS.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((item, qIndex) => {
                  const id = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === id;
                  
                  // Simple search filter
                  if (searchTerm && !item.q.toLowerCase().includes(searchTerm.toLowerCase()) && !item.a.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return null;
                  }

                  return (
                    <div key={qIndex} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => toggleAccordion(id)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                      >
                        <span className="font-semibold text-lg">{item.q}</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-0 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800">
          <h3 className="text-xl font-bold mb-2">Still need help?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Our support team is always ready to assist you.</p>
          <DynamicButton onClick={() => navigate('/contact')} className="px-8 py-3 font-bold">
            Contact Us
          </DynamicButton>
        </div>
      </div>
    </div>
  );
}
