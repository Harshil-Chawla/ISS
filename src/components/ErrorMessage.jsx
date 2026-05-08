import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message">
      <div>
        <strong>Something went wrong</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button className="button button-secondary" onClick={onRetry} type="button">
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}
