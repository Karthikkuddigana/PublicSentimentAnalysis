import { useState } from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';

export default function DataInput({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const requiredHeaders = ['S No', 'Organization name', 'Username', 'Review', 'Review submitted date'];

  const validateCSVHeaders = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const firstLine = text.split('\n')[0];
        const headers = firstLine.split(',').map(h => h.trim().replace(/["\r]/g, ''));
        
        const missingHeaders = requiredHeaders.filter(required => 
          !headers.some(header => header.toLowerCase() === required.toLowerCase())
        );
        
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}`));
        } else {
          resolve(true);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFileDrop = async (acceptedFiles) => {
    setError('');
    setValidationError('');
    
    if (acceptedFiles.length === 0) {
      setValidationError('Please select a CSV file');
      return;
    }

    const selectedFile = acceptedFiles[0];
    
    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setValidationError('Only CSV files are accepted');
      setFile(null);
      return;
    }

    // Validate CSV headers
    try {
      await validateCSVHeaders(selectedFile);
      setFile(selectedFile);
      setValidationError('');
    } catch (err) {
      setValidationError(err.message);
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a CSV file');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const organizationId = localStorage.getItem('organization_id');
      if (!organizationId) {
        throw new Error('Organization ID not found. Please log in again.');
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
      
      // Use fetch instead of axios for file upload to avoid CORS issues
      const response = await fetch(
        `${apiBaseUrl}/manual-reviews/upload?organization_id=${organizationId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (onSubmit) {
        onSubmit(data);
      }
      
      // Success feedback - show modal
      setFile(null);
      setShowSuccessModal(true);
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 mb-6 relative">
      {/* Processing Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <svg 
                className="animate-spin h-16 w-16 text-blue-600" 
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Processing Your File
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Uploading and analyzing reviews...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              This may take a few moments
            </p>
            <div className="mt-4 flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-8 transform transition-all animate-[scale-in_0.2s_ease-out]">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-green-600 dark:text-green-400" 
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
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Upload Successful!
              </h3>
              
              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your CSV file has been successfully uploaded and is now being processed. 
                The reviews will be available in your dashboard shortly.
              </p>
              
              {/* Success Details */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-green-800 dark:text-green-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">File received and validated</span>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Upload Manual Reviews
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Upload a CSV file with required headers: S No, Organization name, Username, Review, Review submitted date
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {validationError && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{validationError}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Upload CSV File
          </label>
          <Dropzone 
            onDrop={handleFileDrop} 
            accept={{
              'text/csv': ['.csv'],
            }}
            multiple={false}
            disabled={isLoading}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isLoading
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-50'
                    : isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer'
                    : validationError
                    ? 'border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600 cursor-pointer'
                    : file
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 cursor-pointer'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer'
                }`}
              >
                <input {...getInputProps()} disabled={isLoading} />
                <div className="flex flex-col items-center">
                  <svg
                    className={`w-12 h-12 mb-3 ${
                      file 
                        ? 'text-green-500 dark:text-green-400' 
                        : validationError
                        ? 'text-red-400 dark:text-red-600'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
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
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                        ✓ {file.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        File validated successfully
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        Drag & drop CSV file here, or click to select
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Only CSV files are accepted
                      </p>
                      <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Required Headers:</p>
                        <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-0.5">
                          {requiredHeaders.map((header, idx) => (
                            <li key={idx}>• {header}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </Dropzone>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !file}
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
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
              Uploading...
            </span>
          ) : (
            'Upload Reviews'
          )}
        </button>
      </div>
    </div>
  );
}