export type NewsArticle = {
  id: string;
  title: string;
  url: string;
  source: string;
  imageUrl?: string;
  categories?: string;
  publishedAt: number; // epoch seconds
  body?: string;
};

type FetchNewsParams = {
  lang?: 'PT' | 'EN';
  categories?: string[];
  excludeCategories?: string[];
  pageSize?: number;
  // Filtra notícias por idade máxima (em dias). Se não definido, não filtra por idade.
  maxAgeDays?: number;
  signal?: AbortSignal;
};

// CryptoCompare public news feed (supports CORS). No API key for basic access.
// Docs: https://min-api.cryptocompare.com/documentation?key=news
export async function fetchNews({
  lang = 'PT',
  categories = [],
  excludeCategories = [],
  pageSize = 24,
  maxAgeDays,
  signal,
}: FetchNewsParams = {}): Promise<NewsArticle[]> {
  const url = new URL('https://min-api.cryptocompare.com/data/v2/news/');
  url.searchParams.set('lang', lang);
  if (categories.length > 0) {
    url.searchParams.set('categories', categories.join(','));
  }
  if (excludeCategories.length > 0) {
    url.searchParams.set('excludeCategories', excludeCategories.join(','));
  }
  // CryptoCompare returns up to ~50 by default; no strict pageSize param, we will slice afterwards.

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Falha ao carregar notícias (${res.status}): ${text}`);
  }

  const json = await res.json();
  const data = Array.isArray(json?.Data) ? json.Data : [];

  const mapped: NewsArticle[] = data.map((item: any) => ({
    id: String(item.id ?? item.guid ?? item.url ?? Math.random()),
    title: String(item.title ?? 'Sem título'),
    url: String(item.url ?? '#'),
    source: String(item.source ?? item.source_info?.name ?? 'Fonte'),
    imageUrl: item.imageurl || item.thumbnail || undefined,
    categories: item.categories || item.tags || undefined,
    publishedAt: Number(item.published_on ?? Math.floor(Date.now() / 1000)),
    body: item.body || item.summary || undefined,
  }));

  // Opcional: filtrar por idade máxima
  let filtered = mapped;
  if (typeof maxAgeDays === 'number' && Number.isFinite(maxAgeDays) && maxAgeDays > 0) {
    const cutoffSec = Math.floor(Date.now() / 1000) - Math.floor(maxAgeDays * 24 * 60 * 60);
    filtered = mapped.filter((n) => n.publishedAt >= cutoffSec);
  }

  // Ordena por mais recentes primeiro (desc) e limita ao pageSize
  const sortedDesc = filtered.sort((a, b) => b.publishedAt - a.publishedAt);
  return sortedDesc.slice(0, pageSize);
}