import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchNewsByCategories, fetchNewsCategory } from '../services/newsService';
import { getCachedData, setCachedData } from '../utils/cache';

const CACHE_KEY = 'dashboard-news-cache';
const CATEGORIES = ['science', 'technology'];

export function useNewsData() {
  const cached = getCachedData(CACHE_KEY);
  const [articles, setArticles] = useState(cached || []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshingCategory, setRefreshingCategory] = useState('');

  const loadNews = useCallback(async ({ force = false } = {}) => {
    const freshCache = !force ? getCachedData(CACHE_KEY) : null;
    if (freshCache) {
      setArticles(freshCache);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const fresh = await fetchNewsByCategories(CATEGORIES);
      setArticles(fresh);
      setCachedData(CACHE_KEY, fresh);
      toast.success('Latest news loaded');
    } catch (err) {
      const message = err.message || 'Unable to fetch news.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCategory = useCallback(async (category) => {
    try {
      setRefreshingCategory(category);
      setError('');
      const freshCategory = await fetchNewsCategory(category);
      setArticles((current) => {
        const otherArticles = current.filter((article) => article.category !== category);
        const updated = [...otherArticles, ...freshCategory].slice(0, 10);
        setCachedData(CACHE_KEY, updated);
        return updated;
      });
      toast.success(`${category} news refreshed`);
    } catch (err) {
      const message = err.message || `Unable to refresh ${category} news.`;
      setError(message);
      toast.error(message);
    } finally {
      setRefreshingCategory('');
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const byCategory =
      activeCategory === 'all'
        ? articles
        : articles.filter((article) => article.category === activeCategory);

    const bySearch = !normalizedQuery
      ? byCategory
      : byCategory.filter((article) =>
          [article.title, article.source, article.author, article.description, article.category]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)
        );

    return [...bySearch].sort((a, b) => {
      if (sortBy === 'source') return a.source.localeCompare(b.source);
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [activeCategory, articles, query, sortBy]);

  const categories = useMemo(() => {
    const current = [...new Set(articles.map((article) => article.category))];
    return current.length ? current : CATEGORIES;
  }, [articles]);

  return {
    articles,
    filteredArticles,
    categories,
    isLoading,
    error,
    query,
    setQuery,
    sortBy,
    setSortBy,
    activeCategory,
    setActiveCategory,
    refreshingCategory,
    refreshCategory,
    loadNews
  };
}
