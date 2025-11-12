import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import type { NewsArticle } from '../services/news';

export default function NoticiaDetalhe() {
  const { id } = useParams();
  const location = useLocation();
  const stateArticle = location.state as NewsArticle | undefined;

  let article: NewsArticle | undefined = stateArticle;

  if (!article && id) {
    try {
      const cached = localStorage.getItem('newsCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const ts = Number(parsed?.ts ?? 0);
        const isFresh = Date.now() - ts < 30 * 60 * 1000; // 30 minutos
        if (isFresh) {
          const arr: NewsArticle[] = Array.isArray(parsed?.items) ? parsed.items : [];
          article = arr.find((a) => String(a.id) === String(id));
        }
      }
    } catch {}
  }

  if (!article) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            Não foi possível carregar a notícia. Volte para a lista e tente novamente.
          </div>
          <Link to="/noticias" className="inline-block mt-4 text-blue-600 hover:text-blue-800">← Voltar para Notícias</Link>
        </div>
      </section>
    );
  }

  const formatDate = (epochSec: number) => {
    try {
      const d = new Date(epochSec * 1000);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return '';
    }
  };

  const estimateReadingMinutes = (body?: string): number => {
    if (!body) return 1;
    const words = body.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const splitCategories = (cats?: string): string[] => {
    if (!cats) return [];
    return cats
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const pageUrl = (typeof window !== 'undefined' ? window.location.href : article.url) || article.url || '';
  const shareText = `${article.title} - ${article.source}`;
  const [copied, setCopied] = React.useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(article.url || pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/noticias" className="text-blue-600 hover:text-blue-800">← Voltar para Notícias</Link>
        <article className="mt-6 bg-white shadow rounded overflow-hidden">
          {article.imageUrl ? (
            <img
              src={toProxy(article.imageUrl)}
              alt={article.title}
              className="w-full h-64 object-cover"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = fallbackImg;
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200" />
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
            <div className="mt-2 text-sm text-gray-600">
              <span>{article.source}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(article.publishedAt)}</span>
              {article.body && (
                <>
                  <span className="mx-2">•</span>
                  <span>{estimateReadingMinutes(article.body)} min leitura</span>
                </>
              )}
            </div>
            {splitCategories(article.categories).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {splitCategories(article.categories).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {article.body && (
              <div className="prose prose-sm sm:prose lg:prose-lg mt-4">
                <p>{article.body}</p>
              </div>
            )}
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800"
            >
              Ler no site da fonte →
            </a>

            {/* Compartilhar */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + (article.url || pageUrl))}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(article.url || pageUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Twitter/X
              </a>
              <button
                onClick={copyLink}
                className="px-3 py-2 text-sm rounded bg-gray-800 text-white hover:bg-gray-900"
              >
                {copied ? 'Link copiado!' : 'Copiar link'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

// Proxy para evitar bloqueios/Mixed Content em imagens externas
const toProxy = (url?: string): string => {
  if (!url) return '';
  const normalized = url.replace(/^http:\/\//i, 'https://');
  return `https://images.weserv.nl/?url=${encodeURIComponent(normalized)}&w=1200&h=300&fit=cover&output=webp`;
};

const fallbackImg =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="24">Imagem indisponível</text></svg>'
  );