import { Toaster } from 'react-hot-toast';
import React, { lazy, Suspense } from 'react';
import ErrorMessage from './components/ErrorMessage';
import Header from './components/Header';
import ISSStats from './components/ISSStats';
import Loader from './components/Loader';
import NewsDashboard from './components/NewsDashboard';
import PeopleInSpace from './components/PeopleInSpace';
import { useISSData } from './hooks/useISSData';
import { useNewsData } from './hooks/useNewsData';
import { useTheme } from './hooks/useTheme';

const Chatbot = lazy(() => import('./components/Chatbot'));
const ISSMap = lazy(() => import('./components/ISSMap'));
const NewsDistributionChart = lazy(() => import('./components/NewsDistributionChart'));
const SpeedChart = lazy(() => import('./components/SpeedChart'));

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const issData = useISSData();
  const newsData = useNewsData();

  const newsContext = {
    articles: newsData.articles,
    categories: newsData.categories
  };

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{ className: 'toast' }} />
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="dashboard">
        {issData.error && <ErrorMessage message={issData.error} onRetry={issData.refresh} />}

        <section className="mission-grid">
          <div className="panel iss-panel">
            <div className="section-heading mission-heading">
              <h2>ISS Live Tracking</h2>
              <div className="inline-actions">
                <button className="button button-secondary" onClick={issData.refresh} disabled={issData.isRefreshing} type="button">
                  Refresh Now
                </button>
                <span className="button button-secondary">Auto-Refresh: ON</span>
              </div>
            </div>
            <ISSStats
              currentPosition={issData.currentPosition}
              positionsCount={issData.positions.length}
              isLoading={issData.isLoading}
            />
            <Suspense fallback={<Loader label="Loading map" />}>
              <ISSMap currentPosition={issData.currentPosition} positions={issData.positions} />
            </Suspense>
          </div>

          <Suspense fallback={<Loader label="Loading speed chart" />}>
            <SpeedChart data={issData.speedHistory} />
          </Suspense>
        </section>

        <section className="secondary-grid">
          <NewsDashboard
            articles={newsData.articles}
            filteredArticles={newsData.filteredArticles}
            categories={newsData.categories}
            query={newsData.query}
            setQuery={newsData.setQuery}
            sortBy={newsData.sortBy}
            setSortBy={newsData.setSortBy}
            activeCategory={newsData.activeCategory}
            setActiveCategory={newsData.setActiveCategory}
            refreshCategory={newsData.refreshCategory}
            refreshingCategory={newsData.refreshingCategory}
            isLoading={newsData.isLoading}
            error={newsData.error}
            onRetry={() => newsData.loadNews({ force: true })}
          />
          <div className="side-stack">
            <PeopleInSpace people={issData.people} />
            <Suspense fallback={<Loader label="Loading news chart" />}>
              <NewsDistributionChart articles={newsData.articles} onSelectCategory={newsData.setActiveCategory} />
            </Suspense>
          </div>
        </section>
      </main>

      <Suspense fallback={null}>
        <Chatbot iss={issData} people={issData.people} news={newsContext} />
      </Suspense>
    </div>
  );
}
