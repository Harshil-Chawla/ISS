const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const NEWS_SEARCH_URL = 'https://newsapi.org/v2/everything';
const SPACEFLIGHT_URL = 'https://api.spaceflightnewsapi.net/v4/articles';

const DEFAULT_CATEGORIES = ['science', 'technology'];

const normalizeNewsApiArticle = (article, category) => ({
  id: article.url,
  title: article.title || 'Untitled article',
  source: article.source?.name || 'Unknown source',
  author: article.author || 'Unknown author',
  publishedAt: article.publishedAt,
  imageUrl: article.urlToImage || '',
  description: article.description || article.content || 'No description available.',
  url: article.url,
  category
});

const normalizeFallbackArticle = (article) => ({
  id: String(article.id),
  title: article.title || 'Untitled article',
  source: article.news_site || 'Spaceflight News',
  author: article.authors?.[0]?.name || 'Unknown author',
  publishedAt: article.published_at,
  imageUrl: article.image_url || '',
  description: article.summary || 'No description available.',
  url: article.url,
  category: 'space'
});

async function fetchFromNewsApi(category, apiKey) {
  const params = new URLSearchParams({
    apiKey,
    category,
    pageSize: '5',
    language: 'en',
    country: 'us'
  });

  const response = await fetch(`${NEWS_API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`NewsAPI failed for ${category}.`);

  const data = await response.json();
  if (data.status !== 'ok') throw new Error(data.message || 'NewsAPI returned an invalid response.');

  return (data.articles || []).map((article) => normalizeNewsApiArticle(article, category));
}

async function fetchFallbackNews() {
  const params = new URLSearchParams({
    limit: '10',
    ordering: '-published_at'
  });

  const response = await fetch(`${SPACEFLIGHT_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Fallback news API failed.');

  const data = await response.json();
  return (data.results || []).map(normalizeFallbackArticle);
}

export async function fetchNewsByCategories(categories = DEFAULT_CATEGORIES) {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    return fetchFallbackNews();
  }

  try {
    const results = await Promise.all(categories.map((category) => fetchFromNewsApi(category, apiKey)));
    const merged = results.flat();
    return merged.slice(0, 10);
  } catch {
    return fetchFallbackNews();
  }
}

export async function fetchNewsCategory(category) {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    const fallback = await fetchFallbackNews();
    return fallback.map((article) => ({ ...article, category: 'space' })).slice(0, 5);
  }

  try {
    return fetchFromNewsApi(category, apiKey);
  } catch {
    const fallback = await fetchFallbackNews();
    return fallback.slice(0, 5).map((article) => ({ ...article, category }));
  }
}

export async function searchNews(query) {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  if (!apiKey || !query.trim()) return [];

  const params = new URLSearchParams({
    apiKey,
    q: query,
    pageSize: '10',
    language: 'en',
    sortBy: 'publishedAt'
  });

  const response = await fetch(`${NEWS_SEARCH_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('News search failed.');

  const data = await response.json();
  return (data.articles || []).map((article) => normalizeNewsApiArticle(article, 'search'));
}
