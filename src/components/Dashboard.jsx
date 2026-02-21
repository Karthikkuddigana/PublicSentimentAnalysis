import { Pie, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

function Dashboard({ data }) {
  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [{ data: [data.sentiments.positive, data.sentiments.negative, data.sentiments.neutral], backgroundColor: ['#4CAF50', '#F44336', '#FFEB3B'] }],
  };

  // Similar for line chart (time trends), bar (source comparison), language breakdown

  return (
    <div className="dashboard">
      <h2>Sentiment Insights</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div><Pie data={sentimentData} options={{ responsive: true }} /></div>
        {/* Add Line for trends, Bar for comparisons */}
      </div>
    </div>
  );
}

export default Dashboard;