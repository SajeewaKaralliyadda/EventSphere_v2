import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center">
        You do not have the required permissions to view this page. Please contact your system administrator if you believe this is an error.
      </p>
      <button 
        onClick={() => navigate('/')}
        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return Home
      </button>
    </div>
  );
}
