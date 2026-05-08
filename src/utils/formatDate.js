export function formatDate(dateInput, options = {}) {
  if (!dateInput) return 'Unknown date';

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat('en', {
    dateStyle: options.dateStyle || 'medium',
    timeStyle: options.timeStyle || 'short'
  }).format(date);
}

export function formatTime(dateInput) {
  if (!dateInput) return '--:--';

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '--:--';

  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}
