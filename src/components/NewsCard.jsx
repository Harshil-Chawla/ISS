import React from 'react';
import { ExternalLink } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function NewsCard({ article }) {
  return (
    <article className="news-card">
      <div className="news-image-wrap">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt="" loading="lazy" />
        ) : (
          <div className="news-image-fallback">{article.category}</div>
        )}
      </div>
      <div className="news-card-body">
        <div className="news-meta">
          <span>{article.source}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <div className="news-footer">
          <span>{article.author}</span>
          <a className="button button-secondary" href={article.url} target="_blank" rel="noreferrer">
            <ExternalLink size={15} />
            Read More
          </a>
        </div>
      </div>
    </article>
  );
}
