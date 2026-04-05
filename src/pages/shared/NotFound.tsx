import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowLeft } from 'lucide-react';
import DynamicButton from '../../components/ui/DynamicButton';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-lg w-full">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Globe className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 tracking-tighter">
          404
        </h1>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Oops! Page not found.
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
          We couldn't find the event or page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
        </p>

        <Link to="/">
          <DynamicButton className="inline-flex items-center gap-2 px-8 py-3 text-base font-bold">
            <ArrowLeft className="w-5 h-5" />
            Go back to Homepage
          </DynamicButton>
        </Link>
      </div>
    </div>
  );
}
