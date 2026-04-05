import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star } from 'lucide-react';
import DynamicButton from './DynamicButton';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  eventTitle: string;
}

export default function ReviewModal({ isOpen, onClose, onSubmit, eventTitle }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, review);
      setRating(0);
      setReview('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Leave a Review</h3>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                How was your experience at <strong className="text-slate-900 dark:text-white">{eventTitle}</strong>?
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-slate-300 dark:text-slate-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Write your review</label>
                  <textarea 
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell us what you liked or what could be improved..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <DynamicButton 
                    type="submit"
                    disabled={rating === 0}
                    className="px-5 py-2.5 rounded-xl font-medium"
                  >
                    Submit Review
                  </DynamicButton>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
