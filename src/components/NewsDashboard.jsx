import React from 'react';
import { RefreshCw, Search } from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import NewsCard from './NewsCard';

export default function NewsDashboard({
  filteredArticles,
  categories,
  query,
  setQuery,
  sortBy,
  setSortBy,
  activeCategory,
  setActiveCategory,
  refreshCategory,
  refreshingCategory,
  isLoading,
  error,
  onRetry
}) {
  return (
    <section className="panel news-dashboard">
      <div className="section-heading">
        <div>
          <h2>Breaking News</h2>
        </div>
        <button className="button button-secondary" type="button" onClick={onRetry}>
          Refresh
        </button>
      </div>

      <div className="news-controls">
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, source, author..."
          />
        </label>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort articles">
          <option value="date">Sort by date</option>
          <option value="source">Sort by source</option>
        </select>
      </div>

      <div className="category-row">
        <button
          className={`chip ${activeCategory === 'all' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map((category) => (
          <div className="category-action" key={category}>
            <button
              className={`chip ${activeCategory === category ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
            <button
              className="icon-button small"
              type="button"
              title={`Refresh ${category}`}
              aria-label={`Refresh ${category}`}
              onClick={() => refreshCategory(category)}
              disabled={refreshingCategory === category}
            >
              <RefreshCw size={15} className={refreshingCategory === category ? 'spin-icon' : ''} />
            </button>
          </div>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={onRetry} />}
      {isLoading ? (
        <div className="news-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="skeleton-card" key={index} />
          ))}
        </div>
      ) : filteredArticles.length ? (
        <div className="news-grid">
          {filteredArticles.map((article) => (
            <NewsCard article={article} key={article.id || article.url} />
          ))}
        </div>
      ) : (
        <Loader label="No matching articles" />
      )}
    </section>
  );
}
