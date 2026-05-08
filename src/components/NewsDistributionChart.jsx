import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#20c997', '#60a5fa', '#f59e0b', '#ef4444', '#a78bfa'];

export default function NewsDistributionChart({ articles, onSelectCategory }) {
  const data = Object.values(
    articles.reduce((acc, article) => {
      const category = article.category || 'uncategorized';
      acc[category] = acc[category] || { name: category, value: 0 };
      acc[category].value += 1;
      return acc;
    }, {})
  );

  return (
    <section className="panel chart-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Visible articles</p>
          <h2>News Distribution</h2>
        </div>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={4}
              onClick={(slice) => onSelectCategory(slice.name)}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} className="chart-slice" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
