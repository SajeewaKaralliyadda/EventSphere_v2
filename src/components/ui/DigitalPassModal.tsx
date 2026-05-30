import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Calendar, MapPin, Clock, ShieldCheck, User, AlertTriangle } from 'lucide-react';
import DynamicButton from './DynamicButton';
import QRCode from 'react-qr-code';

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
}

export default function DigitalPassModal({ isOpen, onClose, ticket }: DigitalPassModalProps) {
  const [isQrRevealed, setIsQrRevealed] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  if (!isOpen || !ticket) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        />

        {/* Boarding Pass Container */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="relative w-full max-w-sm mx-auto flex flex-col drop-shadow-2xl"
        >
          {/* Close Button (Outside Pass) */}
          <button 
            onClick={onClose} 
            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Top Section: Event Info */}
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl overflow-hidden relative">
            <div className="h-24 w-full relative">
              <img src={ticket.thumbnail} alt="Event" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                <span className="text-white/90 text-xs font-bold uppercase tracking-wider">{ticket.tenantName}</span>
                <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-bold">
                  {ticket.tier}
                </span>
              </div>
            </div>
            
            <div className="p-6 pb-8">
              <h2 className="text-xl font-bold leading-tight mb-4">{ticket.title}</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{ticket.date}</p>
                    <p className="text-slate-500 dark:text-slate-400">{ticket.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <p className="font-medium text-slate-900 dark:text-white">{ticket.location}</p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{ticket.attendeeName}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Ticket ID: {ticket.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider with Cutouts */}
          <div className="relative h-8 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
            <div className="absolute left-[-16px] w-8 h-8 bg-slate-900/80 rounded-full" />
            <div className="w-full border-t-2 border-dashed border-slate-200 dark:border-slate-700 mx-6" />
            <div className="absolute right-[-16px] w-8 h-8 bg-slate-900/80 rounded-full" />
          </div>

          {/* Bottom Section: QR Code */}
          <div className="bg-white dark:bg-slate-900 rounded-b-3xl p-6 flex flex-col items-center justify-center relative">
            <div className="relative w-48 h-48 mb-4 flex items-center justify-center">
              {/* Real QR Code */}
              <div className={`absolute inset-0 bg-white rounded-xl p-4 transition-all duration-500 shadow-inner flex items-center justify-center ${!isQrRevealed ? 'blur-md scale-95 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
                <QRCode 
                  value={`TICKET:${ticket.id}`} 
                  size={160}
                  level="H"
                />
              </div>

              {!isQrRevealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <DynamicButton onClick={() => setIsQrRevealed(true)} className="shadow-xl">
                    Reveal QR Code
                  </DynamicButton>
                </div>
              )}
            </div>
            
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 max-w-[200px] mb-4">
              {isQrRevealed 
                ? "Present this code at the entrance for scanning." 
                : "Keep your QR code hidden until you reach the gate."}
            </p>

            <button 
              onClick={() => setIsCancelDialogOpen(true)}
              className="mt-2 text-xs font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 underline transition-colors"
            >
              Request Cancellation / Refund
            </button>
          </div>
        </motion.div>

        {/* Cancellation Confirmation Dialog */}
        <AnimatePresence>
          {isCancelDialogOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setIsCancelDialogOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6"
              >
                <div className="flex items-center gap-3 mb-4 text-orange-600 dark:text-orange-400">
                  <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Refund</h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Are you sure you want to request a cancellation for <strong className="text-slate-900 dark:text-white">{ticket.title}</strong>? 
                  Please note that the final refund amount is up to the Organizer's discretion and may not be 100%.
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setIsCancelDialogOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={() => {
                      // Implement refund request logic here
                      console.log('Refund requested for ticket:', ticket.id);
                      setIsCancelDialogOpen(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
