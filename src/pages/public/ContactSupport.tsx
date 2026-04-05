import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import DynamicButton from '../../components/ui/DynamicButton';

export default function ContactSupport() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000); // Reset after 5s
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <GlobalNavbar />
      
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Get in Touch</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Have a question, feedback, or need assistance? Our team is here to help. Fill out the form below and we'll get back to you shortly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Email Us</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">support@eventsphere.com</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">partnerships@eventsphere.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Call Us</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">+1 (555) 123-4567</p>
                      <p className="text-xs text-slate-400 mt-1">Mon-Fri, 9am - 6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Headquarters</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        123 Innovation Drive<br />
                        Tech Valley, CA 94043<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-10 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                      Thank you for reaching out. Our support team has received your message and will get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">First Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Last Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Subject</label>
                    <select 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="">Select a topic...</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="partnership">Partnership Request</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Message</label>
                    <textarea 
                      rows={5}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    ></textarea>
                  </div>

                  <DynamicButton type="submit" className="w-full py-4 text-base font-bold flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" /> Send Message
                  </DynamicButton>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
