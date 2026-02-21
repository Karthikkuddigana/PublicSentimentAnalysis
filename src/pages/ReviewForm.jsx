import { useState } from 'react';
import Dropzone from 'react-dropzone';

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    // Simulate API call
    setTimeout(() => {
      setSuccessMessage('Review submitted successfully!');
      setIsSubmitting(false);
      // Reset form
      setRating(0);
      setReview('');
      setFile(null);
      setPlatform('');
      setCategory('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Submit Review
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Share your feedback and upload relevant files for sentiment analysis
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✓ {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Platform Selection */}
            <div>
              <label
                htmlFor="platform"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Platform
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select a platform</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="reddit">Reddit</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Category Selection */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select a category</option>
                <option value="product">Product Review</option>
                <option value="service">Service Review</option>
                <option value="support">Customer Support</option>
                <option value="general">General Feedback</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <svg
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-300 dark:text-slate-600'
                      } transition-colors`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-slate-700 dark:text-slate-300 font-medium">
                    {rating} out of 5
                  </span>
                )}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label
                htmlFor="review"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Review / Feedback
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
                placeholder="Share your experience in detail..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Minimum 10 characters ({review.length}/10)
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Upload Supporting Files (Optional)
              </label>
              <Dropzone
                onDrop={handleFileDrop}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                  'application/pdf': ['.pdf'],
                  'text/csv': ['.csv'],
                  'application/vnd.ms-excel': ['.xls'],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                }}
                maxSize={5242880} // 5MB
              >
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      {file ? (
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            Selected: {file.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            Drag & drop file here, or click to select
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Images, PDF, CSV, Excel (Max 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Dropzone>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || review.length < 10}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
