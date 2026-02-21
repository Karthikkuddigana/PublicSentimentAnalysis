import { useState } from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';

export default function DataInput({ onSubmit }) {
  const [source, setSource] = useState('file');
  const [file, setFile] = useState(null);
  const [dbConfig, setDbConfig] = useState({ url: '', query: '' });
  const [apiConfig, setApiConfig] = useState({ endpoint: '', params: '' });
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      let data;
      if (source === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        // Send to backend (replace with your backend URL)
        const response = await axios.post('http://localhost:8000/analyze/file', formData);
        data = response.data;
      } else if (source === 'text' && text.trim()) {
        // Mock data for demonstration
        data = {
          sentiments: {
            positive: 60,
            negative: 20,
            neutral: 20,
          },
        };
      } else if (source === 'database' && dbConfig.url) {
        // Mock data for database
        data = {
          sentiments: {
            positive: 45,
            negative: 30,
            neutral: 25,
          },
        };
      } else if (source === 'api' && apiConfig.endpoint) {
        // Mock data for API
        data = {
          sentiments: {
            positive: 55,
            negative: 25,
            neutral: 20,
          },
        };
      } else {
        setError('Please provide the required input for the selected source.');
        setIsLoading(false);
        return;
      }
      onSubmit(data);
    } catch (err) {
      setError('Failed to analyze data. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Select Data Source
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose your preferred input method for sentiment analysis
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label
            htmlFor="source-type"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Source Type
          </label>
          <select
            id="source-type"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="file">File Upload</option>
            <option value="database">Database</option>
            <option value="api">External API (e.g., Tweets)</option>
            <option value="text">Custom Text</option>
          </select>
        </div>

        {source === 'file' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload File
            </label>
            <Dropzone onDrop={handleFileDrop} accept={{
              'text/csv': ['.csv'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'text/plain': ['.txt'],
            }}>
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
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Selected: {file.name}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                          Drag & drop file here, or click to select
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Supports CSV, Excel, and Text files
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Dropzone>
          </div>
        )}

        {source === 'text' && (
          <div>
            <label
              htmlFor="custom-text"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Enter Text
            </label>
            <textarea
              id="custom-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text for sentiment analysis..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
        )}

        {source === 'database' && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="db-url"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Database URL
              </label>
              <input
                id="db-url"
                type="text"
                value={dbConfig.url}
                onChange={(e) => setDbConfig({ ...dbConfig, url: e.target.value })}
                placeholder="postgresql://user:pass@host:port/db"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="db-query"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                SQL Query
              </label>
              <textarea
                id="db-query"
                value={dbConfig.query}
                onChange={(e) => setDbConfig({ ...dbConfig, query: e.target.value })}
                placeholder="SELECT * FROM comments WHERE date > '2024-01-01'"
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}

        {source === 'api' && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="api-endpoint"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                API Endpoint
              </label>
              <input
                id="api-endpoint"
                type="text"
                value={apiConfig.endpoint}
                onChange={(e) => setApiConfig({ ...apiConfig, endpoint: e.target.value })}
                placeholder="https://api.example.com/data"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="api-params"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Parameters (JSON)
              </label>
              <textarea
                id="api-params"
                value={apiConfig.params}
                onChange={(e) => setApiConfig({ ...apiConfig, params: e.target.value })}
                placeholder='{"query": "sentiment", "count": 100}'
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
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
              Analyzing...
            </span>
          ) : (
            'Analyze Sentiment'
          )}
        </button>
      </div>
    </div>
  );
}