import { getRestrictedAnswer } from '../utils/buildChatContext';

const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

export async function askDashboardBot({ question, context }) {
  const directAnswer = answerFromContext(question, context);
  if (directAnswer !== getRestrictedAnswer()) {
    return directAnswer;
  }

  const token = import.meta.env.VITE_HF_API_KEY;
  if (!token) {
    return directAnswer;
  }

  const prompt = `<s>[INST] You are a dashboard assistant. Answer ONLY using the JSON dashboard context below.
If the answer is not directly present in the context, reply exactly:
"${getRestrictedAnswer()}"
Do not use outside knowledge. Do not guess.

Dashboard context:
${JSON.stringify(context, null, 2)}

User question: ${question} [/INST]`;

  try {
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 220,
          temperature: 0.1,
          return_full_text: false
        }
      })
    });

    if (!response.ok) throw new Error('Hugging Face request failed.');
    const data = await response.json();
    const answer = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

    return sanitizeAnswer(answer);
  } catch {
    return answerFromContext(question, context);
  }
}

function sanitizeAnswer(answer) {
  const cleaned = String(answer || '').trim();
  if (!cleaned) return getRestrictedAnswer();
  return cleaned.replace(/<\/?s>|\[\/?INST\]/g, '').trim();
}

function answerFromContext(question, context) {
  const q = question.toLowerCase();
  const { iss, peopleInSpace, news } = context;
  const hasIssData = iss.latitude !== null && iss.longitude !== null;

  if (q.includes('iss') || q.includes('space station')) {
    if (!hasIssData) {
      return 'ISS data is still loading. Try again after the dashboard receives the current position.';
    }

    const crew = peopleInSpace.astronauts
      .filter((person) => person.craft === 'ISS')
      .map((person) => person.name)
      .join(', ');

    return [
      `The dashboard currently shows the ISS at latitude ${Number(iss.latitude).toFixed(3)} and longitude ${Number(iss.longitude).toFixed(3)}.`,
      `Its calculated speed is ${Math.round(iss.speedKmH || 0).toLocaleString()} km/h.`,
      `Location label: ${iss.locationName || 'unknown'}.`,
      `Tracked positions stored: ${iss.positionsTracked}.`,
      crew ? `ISS crew shown: ${crew}.` : ''
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (q.includes('latitude') || q.includes('longitude') || q.includes('coordinate')) {
    return `The ISS is at latitude ${iss.latitude ?? 'unknown'} and longitude ${iss.longitude ?? 'unknown'}.`;
  }

  if (q.includes('speed')) {
    return `The current calculated ISS speed is ${Math.round(iss.speedKmH || 0).toLocaleString()} km/h.`;
  }

  if (q.includes('location') || q.includes('where')) {
    return `The current ISS location label is: ${iss.locationName || 'unknown'}.`;
  }

  if (q.includes('tracked') || q.includes('position')) {
    return `The dashboard is storing ${iss.positionsTracked} recent ISS positions.`;
  }

  if (q.includes('people') || q.includes('astronaut')) {
    const names = peopleInSpace.astronauts.map((person) => `${person.name} (${person.craft})`).join(', ');
    return `There are ${peopleInSpace.total} people currently in space${names ? `: ${names}` : '.'}`;
  }

  if (q.includes('news') || q.includes('article') || q.includes('headline')) {
    const headlines = news.articles.slice(0, 5).map((article) => article.title).join('; ');
    return `The dashboard shows ${news.totalArticles} articles. Top visible headlines: ${headlines || 'none available'}.`;
  }

  if (q.includes('source')) {
    const sources = [...new Set(news.articles.map((article) => article.source))].join(', ');
    return `Visible news sources include: ${sources || 'none available'}.`;
  }

  return getRestrictedAnswer();
}
