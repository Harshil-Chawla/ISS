import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatTime } from '../utils/formatDate';

export default function SpeedChart({ data }) {
  const chartData = data.map((item) => ({
    ...item,
    time: formatTime(item.timestamp)
  }));

  return (
    <section className="panel chart-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Last 30 measurements</p>
          <h2>ISS Speed Trend</h2>
        </div>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
              }}
              formatter={(value) => [`${Number(value).toLocaleString()} km/h`, 'Speed']}
            />
            <Line type="monotone" dataKey="speed" name="ISS Speed (km/h)" stroke="#cf6357" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
