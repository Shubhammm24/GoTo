import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const ReviewsPage = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle review submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Rate Your Experience</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Star Rating */}
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">How was your ride?</label>
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    className="text-5xl transition-all"
                  >
                    <span className={rating >= star ? '⭐' : '☆'}>
                      {rating >= star ? '⭐' : '☆'}
                    </span>
                  </motion.button>
                ))}
              </div>
              {rating > 0 && <p className="mt-4 text-lg font-bold text-blue-600">{rating} stars</p>}
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">Share your feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors h-32 resize-none"
                placeholder="Tell us about your experience..."
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow"
            >
              <MessageSquare className="inline mr-2" size={20} />
              Submit Review
            </motion.button>
          </form>
        </motion.div>

        {/* Past Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-soft p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Reviews</h2>

          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item * 0.1 }}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">John (Driver)</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <p className="text-gray-600">Great driver, very professional and courteous service!</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewsPage;
