import React, { useState } from 'react';
import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckCircle, 
  CreditCard, 
  User, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  ShieldCheck,
  Ticket,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import { createBooking } from '../../services/attendeeService';
import api from '../../lib/api';

export default function CheckoutWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { event, tickets, totalPrice } = location.state || {};

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  // Auth protection - Must be attendee to checkout
  if (!user || user.role !== 'ATTENDEE') {
    // Store where to go after login
    sessionStorage.setItem('redirectAfterLogin', '/checkout');
    // Important: we also need to store the order state so it's not lost after login!
    // For a real app this would be in a DB, but for this mock we'll use sessionStorage
    if (event) {
        sessionStorage.setItem('pendingOrder', JSON.stringify({ event, tickets, totalPrice }));
    }
    return <Navigate to="/login" replace />;
  }

  // Redirect back if accessed without state
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No order found</h2>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const selectedTiers = event.tiers.filter((t: any) => tickets[t.id] > 0);
  const totalQuantity = selectedTiers.reduce((acc: number, tier: any) => acc + tickets[tier.id], 0);

  const finalPrice = appliedPromo 
    ? appliedPromo.type === 'PERCENTAGE' 
      ? totalPrice * (1 - appliedPromo.discountValue / 100) 
      : Math.max(0, totalPrice - appliedPromo.discountValue)
    : totalPrice;

  const steps = [
    { num: 1, title: 'Details', icon: User },
    { num: 2, title: 'Payment', icon: CreditCard },
    { num: 3, title: 'Confirmation', icon: CheckCircle },
  ];

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Submits booking details to backend and redirects to Stripe Checkout if applicable
      const bookingResponse = await createBooking(event.id, tickets, appliedPromo?.code);
      if (bookingResponse.checkoutUrl) {
        window.location.href = bookingResponse.checkoutUrl;
      } else {
        setStep(3);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPromoCode = async () => {
    if (!promoCode) return;
    setIsCheckingPromo(true);
    setPromoError('');
    try {
      // Validates promo code limits and conditions against the backend before applying discount
      const res = await api.post(`/api/public/promo-codes/validate`, {
        code: promoCode.toUpperCase(),
        eventId: event.id,
        originalAmount: totalPrice
      });
      if (res.data && res.data.valid) {
        setAppliedPromo({
          code: res.data.code,
          type: res.data.discountType,
          discountValue: res.data.discountValue
        });
        setPromoError('');
        toast.success('Promo code applied!');
      } else {
        setPromoError(res.data.message || 'Invalid or expired promo code');
        setAppliedPromo(null);
      }
    } catch (err: any) {
      setPromoError(err.response?.data?.message || 'Failed to verify promo code');
    } finally {
      setIsCheckingPromo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 pb-24">
      <GlobalNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Button (Only on Step 1 & 2) */}
        {step < 3 && (
          <button 
            onClick={() => step === 1 ? navigate(-1) : setStep(1)} 
            className="inline-flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 
            {step === 1 ? 'Back to Event' : 'Back to Details'}
          </button>
        )}

        {/* Visual Stepper */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.num;
              const isCurrent = step === s.num;
              
              return (
                <div key={s.num} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950 px-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                    isActive 
                      ? 'bg-blue-600 border-blue-100 dark:border-blue-900/50 text-white' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-bold ${
                    isCurrent ? 'text-blue-600 dark:text-blue-400' : 
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {step === 3 ? (
          /* Step 3: Confirmation Layout */
          <div className="max-w-2xl mx-auto mt-16">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
              
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Booking Confirmed!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                Your booking ID is <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md ml-1">EVT-{Math.floor(100000 + Math.random() * 900000)}</span>
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-left mb-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <img src={event.thumbnail} alt={event.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{event.title}</h4>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <Calendar className="w-4 h-4 mr-1.5" /> {event.date}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Total Tickets: {totalQuantity}</span>
                  <span className="font-bold text-xl text-blue-600 dark:text-blue-400">Rs. {finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/attendee/wallet')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-blue-500/25 flex items-center justify-center"
                >
                  <Ticket className="w-5 h-5 mr-2" /> View My Tickets
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
        ) : (
          /* Step 1 & 2: Two Column Layout */
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left Column (Forms) */}
            <div className="lg:w-2/3">
              {step === 1 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6">Attendee Details</h2>
                  <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                        <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                        <input type="email" required placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                        <input type="tel" required placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Student ID (Optional)</label>
                        <input type="text" placeholder="e.g. 12345678" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Special Requests</label>
                      <textarea rows={3} placeholder="Any dietary requirements or accessibility needs?" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"></textarea>
                    </div>
                    
                    <div className="pt-4">
                      <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-blue-500/25">
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Payment Details</h2>
                    <div className="flex gap-2">
                      <div className="w-10 h-6 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                      <div className="w-10 h-6 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold">MC</div>
                    </div>
                  </div>
                  
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Promo Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={promoCode}
                          onChange={e => setPromoCode(e.target.value)}
                          disabled={!!appliedPromo}
                          placeholder="Have a promo code?" 
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase" 
                        />
                        {appliedPromo ? (
                          <button type="button" onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="px-4 py-3 bg-red-100 text-red-600 font-medium rounded-xl hover:bg-red-200">Remove</button>
                        ) : (
                          <button type="button" onClick={checkPromoCode} disabled={!promoCode || isCheckingPromo} className="px-4 py-3 bg-slate-200 dark:bg-slate-700 font-medium rounded-xl disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600">Apply</button>
                        )}
                      </div>
                      {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
                      {appliedPromo && <p className="text-emerald-500 text-sm mt-1">Promo code applied successfully!</p>}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <p>You will be securely redirected to Stripe to complete your payment.</p>
                    </div>

                    <div className="pt-4">
                      <button type="submit" disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : `Proceed to Payment • Rs. ${finalPrice.toFixed(2)}`}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column (Order Summary) */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24">
                <div className="h-40 relative">
                  <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg line-clamp-1">{event.title}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-4">Order Summary</h4>
                  
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0"/> 
                      <span className="truncate">{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0"/> 
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {selectedTiers.map((tier: any) => (
                      <div key={tier.id} className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{tier.name}</p>
                          <p className="text-sm text-slate-500">Qty: {tickets[tier.id]}</p>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Rs. {(tier.price * tickets[tier.id]).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>Rs. {totalPrice.toFixed(2)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Discount ({appliedPromo.code})</span>
                        <span>- Rs. {(totalPrice - finalPrice).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        Rs. {finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
