import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Ticket } from 'lucide-react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import { confirmBooking } from '../../services/attendeeService';
import { toast } from 'react-hot-toast';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    confirmBooking(sessionId)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        console.error('Confirmation error:', err);
        setStatus('error');
        toast.error('Payment confirmation failed. Please contact support.');
      });
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 pb-24">
      <GlobalNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
            <h2 className="text-2xl font-bold">Verifying Payment...</h2>
            <p className="text-slate-500">Please wait while we confirm your booking with Stripe.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
              
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Payment Successful!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                Your booking is confirmed. Your tickets are now available in your wallet.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/attendee/wallet')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-blue-500/25 flex items-center justify-center"
                >
                  <Ticket className="w-5 h-5 mr-2" /> Go to My Tickets
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Browse More Events
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Payment Verification Failed</h2>
            <p className="text-slate-500">We could not confirm your payment. If you were charged, please contact support.</p>
            <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
              Return to Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
