import { formatDate } from './formatDate';

const fallbackAnswer =
  'I can only answer questions based on the current ISS and news dashboard data.';

export function buildChatContext({ iss, people, news }) {
  const articles = news?.articles || [];

  return {
    iss: {
      latitude: iss?.currentPosition?.latitude ?? null,
      longitude: iss?.currentPosition?.longitude ?? null,
      speedKmH: iss?.currentPosition?.speed ?? null,
      locationName: iss?.currentPosition?.locationName ?? null,
      positionsTracked: iss?.positions?.length ?? 0,
      timestamp: iss?.currentPosition?.timestamp ?? null
    },
    peopleInSpace: {
      total: people?.number ?? 0,
      astronauts: people?.people ?? []
    },
    news: {
      totalArticles: articles.length,
      categories: news?.categories || [],
      articles: articles.map((article) => ({
        title: article.title,
        source: article.source,
        author: article.author,
        category: article.category,
        publishedAt: article.publishedAt,
        publishedLabel: formatDate(article.publishedAt),
        description: article.description
      }))
    }
  };
}

export function getRestrictedAnswer() {
  return fallbackAnswer;
}

export function isLikelyInDashboardScope(message) {
  const text = message.toLowerCase();
  const allowedTerms = [
    'iss',
    'space station',
    'latitude',
    'longitude',
    'speed',
    'location',
    'position',
    'tracked',
    'astronaut',
    'people',
    'craft',
    'space',
    'news',
    'article',
    'source',
    'author',
    'published',
    'date',
    'summary',
    'category',
    'headline',
    'dashboard'
  ];

  return allowedTerms.some((term) => text.includes(term));
}
