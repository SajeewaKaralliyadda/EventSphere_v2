import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, CreditCard, Loader2, Receipt } from 'lucide-react';
import DynamicButton from './DynamicButton';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  tickets: Record<string, number>;
  totalPrice: number;
}

export default function CheckoutModal({ isOpen, onClose, event, tickets, totalPrice }: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter out tiers with 0 quantity
  const selectedTiers = event.tiers.filter((t: any) => tickets[t.id] > 0);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isProcessing && !isSuccess ? onClose : undefined}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Checkout
            </h2>
            {!isProcessing && !isSuccess && (
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {isSuccess ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                <p className="text-slate-500 dark:text-slate-400">Your tickets have been sent to your email and added to your wallet.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{event.date} • {event.location}</p>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-slate-700/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Order Summary</h4>
                  {selectedTiers.map((tier: any) => (
                    <div key={tier.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{tickets[tier.id]}x {tier.name}</span>
                      <span>{tier.price === 0 ? 'Free' : `Rs. ${tier.price * tickets[tier.id]}`}</span>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>Rs. {totalPrice}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment Method</h4>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-sm font-medium flex-1">•••• •••• •••• 4242</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isSuccess && (
            <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
              <DynamicButton 
                className="w-full py-3.5 text-base" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay Rs. ${totalPrice}`
                )}
              </DynamicButton>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
