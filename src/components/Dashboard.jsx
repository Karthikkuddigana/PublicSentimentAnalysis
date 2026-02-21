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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

export default function Dashboard({ data }) {
  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          data.sentiments.positive,
          data.sentiments.negative,
          data.sentiments.neutral,
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Sentiment Insights
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Comprehensive analysis of sentiment distribution
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
          <div className="max-w-xs mx-auto">
            <Pie data={sentimentData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Positive:</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {data.sentiments.positive}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Negative:</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {data.sentiments.negative}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Neutral:</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {data.sentiments.neutral}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Summary
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Overall sentiment is{' '}
            <span className="font-bold">
              {data.sentiments.positive > 50
                ? 'Positive'
                : data.sentiments.negative > 50
                ? 'Negative'
                : 'Neutral'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}