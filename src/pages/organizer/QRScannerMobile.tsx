import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion, AnimatePresence } from 'motion/react';
import { ScanLine, CheckCircle2, XCircle, ArrowLeft, Flashlight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateTicket } from '../../services/organizerService';
import { useAuth } from '../../contexts/AuthContext';

export default function QRScannerMobile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scanStatus, setScanStatus] = useState<'scanning' | 'valid' | 'invalid'>('scanning');
  const [scannedData, setScannedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [manualTicketId, setManualTicketId] = useState('');

  const handleQRScan = async (ticketId: string) => {
    if (scanStatus !== 'scanning') return; // Prevent multiple scans
    try {
      const data = await validateTicket(ticketId);
      setScanStatus('valid');
      setScannedData({
        name: data.attendeeName || data.name || 'Attendee',
        ticketId: ticketId,
        tier: data.ticketTierName || data.tier || 'Valid Pass',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error: any) {
      setScanStatus('invalid');
      setScannedData({
        reason: error.response?.data?.message || 'Ticket already used or invalid QR code.',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Auto reset after 5 seconds
    setTimeout(() => {
      setScanStatus('scanning');
      setScannedData(null);
    }, 5000);
  };

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden relative max-w-md mx-auto shadow-2xl">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center text-white">
        <div className="flex-1 flex justify-start">
          {user?.role !== 'GATE_SCANNER' && (
            <button onClick={() => navigate('/organizer')} className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors" title="Back to Dashboard">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase whitespace-nowrap">
          Gate 1
        </div>
        <div className="flex-1 flex justify-end gap-2">
          <button className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors">
            <Flashlight className="w-6 h-6" />
          </button>
          <button onClick={() => logout()} className="p-2 bg-red-500/60 backdrop-blur-md rounded-full hover:bg-red-500/80 transition-colors" title="Sign Out">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Top Half: Camera Viewfinder or Manual Entry */}
      <div className="relative h-1/2 w-full bg-slate-900 flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Tabs */}
        <div className="absolute top-24 z-30 flex bg-black/40 backdrop-blur-md rounded-full p-1">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'scan' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/10'}`}
          >
            Scan QR
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'manual' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/10'}`}
          >
            Manual Entry
          </button>
        </div>

        {activeTab === 'scan' ? (
          <>
            {/* Fake Camera Feed Background */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80')] bg-cover bg-center" />
            
            {/* Viewfinder Frame */}
            <div className="relative w-64 h-64 z-10 mt-12">
              {/* Corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl" />
              
              {scanStatus === 'scanning' && (
                <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
                  <Scanner 
                    formats={['qr_code']}
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        handleQRScan(result[0].rawValue);
                      }
                    }}
                    styles={{ container: { width: '100%', height: '100%' } }}
                  />
                  <motion.div 
                    animate={{ y: [0, 250, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                  />
                </div>
              )}

              {/* Status Overlay inside viewfinder */}
              <AnimatePresence>
                {scanStatus === 'valid' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm rounded-2xl"
                  >
                    <CheckCircle2 className="w-24 h-24 text-emerald-400 drop-shadow-lg" />
                  </motion.div>
                )}
                {scanStatus === 'invalid' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm rounded-2xl"
                  >
                    <XCircle className="w-24 h-24 text-red-400 drop-shadow-lg" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="relative z-10 w-full px-8 mt-12 flex flex-col items-center">
            <input 
              type="text"
              placeholder="Enter Ticket ID / Reference Code"
              value={manualTicketId}
              onChange={(e) => setManualTicketId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-4 mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
            />
            <button 
              onClick={() => {
                if (manualTicketId) {
                  handleQRScan(manualTicketId);
                  setManualTicketId('');
                }
              }}
              disabled={!manualTicketId || scanStatus !== 'scanning'}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              Verify Ticket
            </button>
          </div>
        )}
      </div>

      {/* Bottom Half: Status & Controls */}
      <div className="h-1/2 w-full bg-white dark:bg-slate-900 rounded-t-[40px] -mt-8 z-20 p-8 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {scanStatus === 'scanning' && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <ScanLine className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Ready to Scan</h2>
                <p className="text-slate-500 dark:text-slate-400">Align QR code within the frame</p>
              </motion.div>
            )}

            {scanStatus === 'valid' && scannedData && (
              <motion.div 
                key="valid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">Valid Ticket</h2>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-left space-y-4 border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Attendee</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{scannedData.name}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Ticket ID</p>
                      <p className="font-medium text-slate-900 dark:text-white">{scannedData.ticketId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Tier</p>
                      <p className="font-medium text-slate-900 dark:text-white">{scannedData.tier}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {scanStatus === 'invalid' && scannedData && (
              <motion.div 
                key="invalid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Invalid Ticket</h2>
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6">
                  <p className="text-red-800 dark:text-red-300 font-medium">{scannedData.reason}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Removed Simulation Controls */}
      </div>
    </div>
  );
}
