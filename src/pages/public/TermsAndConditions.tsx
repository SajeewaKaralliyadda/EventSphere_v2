import React from 'react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <GlobalNavbar />
      
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms and Conditions</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: April 3, 2026</p>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to EventSphere. These Terms and Conditions govern your use of our platform, including our website, mobile applications, and associated services. By accessing or using EventSphere, you agree to be bound by these terms.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>

            <h2>3. Event Creation and Ticketing</h2>
            <p>
              Organizers are responsible for the accuracy of event details, pricing, and refund policies. EventSphere acts as a facilitator and is not responsible for the actual delivery of the event.
            </p>

            <h2>4. Payments and Fees</h2>
            <p>
              EventSphere charges a platform fee on paid tickets. This fee is deducted automatically before payouts are issued to the Organizer or Tenant. All payments are securely processed through our third-party payment providers.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of EventSphere and its licensors.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall EventSphere, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
