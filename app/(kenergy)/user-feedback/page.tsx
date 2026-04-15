'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { Star, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function UserFeedbackPage() {
  const { t } = useLocale();
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('Suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleSubmit = async () => {
    // Validate required fields
    if (!subject || !message) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get userId from localStorage (optional for anonymous feedback)
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr)?.userId : null;

      const response = await fetch('/api/kenergy/user-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          category,
          subject,
          message,
          rating
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ type: 'success', message: t('feedbackSubmittedSuccessfully') || 'Thank you for your feedback!' });
        // Reset form after 2 seconds
        setTimeout(() => {
          setShowModal(false);
          setCategory('Suggestion');
          setSubject('');
          setMessage('');
          setRating(0);
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to submit feedback' });
      }
    } catch (error: unknown) {
      console.error('Feedback submission error:', error);
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {t('userFeedback')}
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
        >
          {t('submitFeedback')}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('weValueYourFeedback')}
            </h2>
            <p className="text-gray-600">
              {t('feedbackDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-semibold text-gray-800 mb-1">{t('suggestions')}</h3>
              <p className="text-sm text-gray-600">{t('suggestionsDesc')}</p>
            </div>
            <div className="p-6 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">🐛</div>
              <h3 className="font-semibold text-gray-800 mb-1">{t('bugReports')}</h3>
              <p className="text-sm text-gray-600">{t('bugReportsDesc')}</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-semibold text-gray-800 mb-1">{t('reviews')}</h3>
              <p className="text-sm text-gray-600">{t('reviewsDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('suggestionAndFeedback')}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-gray-600 text-sm">
                {t('weValueYourFeedbackDesc')}
              </p>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('category')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Suggestion">{t('suggestion')}</option>
                  <option value="Bug Report">{t('bugReport')}</option>
                  <option value="Feature Request">{t('featureRequest')}</option>
                  <option value="General Feedback">{t('generalFeedback')}</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('subject')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('briefSummary')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('pleaseProvideDetails')}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('rateYourExperience')}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('clickToRate')}
                </p>
              </div>
            </div>

            {/* Status Message */}
            {submitStatus && (
              <div className={`mx-6 mb-4 p-4 rounded-md ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <div className="flex items-center gap-2">
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{submitStatus.message}</span>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!subject || !message || isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (t('submitting') || 'Submitting...') : t('submitFeedback')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
