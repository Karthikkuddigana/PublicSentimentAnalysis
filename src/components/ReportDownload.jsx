import jsPDF from 'jspdf';

function ReportDownload({ data }) {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Sentiment Analysis Report', 10, 10);
    doc.text(`Positive: ${data.sentiments.positive}%`, 10, 20);
    // Add more details, charts as images if needed
    doc.save('sentiment-report.pdf');
  };

  return <button onClick={generatePDF}>Download Report</button>;
}

export default ReportDownload;