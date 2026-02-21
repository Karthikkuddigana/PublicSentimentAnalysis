import { useState } from 'react';
import jsPDF from 'jspdf';

export default function ReportDownload({ data }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Sentiment Analysis Report', 20, 20);
      
      // Date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Divider
      doc.line(20, 35, 190, 35);
      
      // Sentiment Results
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Sentiment Distribution', 20, 45);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Positive: ${data.sentiments.positive}%`, 30, 55);
      doc.text(`Negative: ${data.sentiments.negative}%`, 30, 65);
      doc.text(`Neutral: ${data.sentiments.neutral}%`, 30, 75);
      
      // Summary
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Summary', 20, 90);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      const sentiment = data.sentiments.positive > 50
        ? 'Positive'
        : data.sentiments.negative > 50
        ? 'Negative'
        : 'Neutral';
      doc.text(`Overall sentiment: ${sentiment}`, 30, 100);
      
      doc.save('sentiment-analysis-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Export Report
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Download a comprehensive PDF report of your analysis
          </p>
        </div>
        
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center gap-2"
        >
          {isGenerating ? (
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
              Generating...
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}