import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchNews, type NewsArticle } from '../services/news';

export default function Noticias() {
  const [lang, setLang] = useState<'PT' | 'EN'>('PT');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [itemsAll, setItemsAll] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchRaw, setSearchRaw] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = useMemo(
    () => [
      'Blockchain',
      'BTC',
      'ETH',
      'Market',
      'Exchange',
      'Altcoin',
      'Technology',
      'Regulation',
      'Mining',
      'DeFi',
      'NFT',
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNews({ lang, categories: selectedCategories, pageSize: 48 });
        if (!cancelled) setItemsAll(data);
        // Fallback simples: se não houver dados em PT, tenta EN
        if (!cancelled && lang === 'PT' && data.length === 0) {
          const enData = await fetchNews({ lang: 'EN', categories: selectedCategories, pageSize: 48 });
          setItemsAll(enData);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Erro ao carregar notícias');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [lang, selectedCategories]);

  // Inicializa estados a partir da URL (uma vez)
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const s = (searchParams.get('sort') ?? 'recent') as 'recent' | 'oldest';
    const catsParam = searchParams.get('cats') ?? '';
    const lg = (searchParams.get('lang') ?? 'PT') as 'PT' | 'EN';
    const countParam = Number(searchParams.get('count') ?? 9);
    setSearchRaw(q);
    setSearch(q);
    setSort(s === 'oldest' ? 'oldest' : 'recent');
    setSelectedCategories(catsParam ? catsParam.split(',').filter(Boolean) : []);
    setLang(lg === 'EN' ? 'EN' : 'PT');
    setVisibleCount(Number.isFinite(countParam) && countParam > 0 ? countParam : 9);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza a URL quando estados mudam
  useEffect(() => {
    setSearchParams({ q: search || '', sort, cats: selectedCategories.join(','), lang, count: String(visibleCount) });
  }, [search, sort, selectedCategories, lang, visibleCount, setSearchParams]);

  // Debounce da busca
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchRaw.trim());
    }, 250);
    return () => clearTimeout(id);
  }, [searchRaw]);

  // Cache leve para página de detalhe
  useEffect(() => {
    try {
      if (itemsAll.length > 0) {
        const limited = itemsAll.slice(0, 60); // tamanho máximo simples
        localStorage.setItem('newsCache', JSON.stringify({ ts: Date.now(), items: limited }));
      }
    } catch {}
  }, [itemsAll]);

  // Persistir último estado da UI
  useEffect(() => {
    try {
      const ui = { q: searchRaw, sort, cats: selectedCategories, lang, count: visibleCount };
      localStorage.setItem('newsUIState', JSON.stringify(ui));
    } catch {}
  }, [searchRaw, sort, selectedCategories, lang, visibleCount]);

  // Restaurar estado quando não houver parâmetros na URL
  useEffect(() => {
    if (Array.from(searchParams.keys()).length === 0) {
      try {
        const uiRaw = localStorage.getItem('newsUIState');
        if (uiRaw) {
          const ui = JSON.parse(uiRaw);
          setSearchRaw(ui.q ?? '');
          setSearch(ui.q ?? '');
          setSort(ui.sort === 'oldest' ? 'oldest' : 'recent');
          setSelectedCategories(Array.isArray(ui.cats) ? ui.cats : []);
          setLang(ui.lang === 'EN' ? 'EN' : 'PT');
          setVisibleCount(Number.isFinite(ui.count) && ui.count > 0 ? ui.count : 9);
          setSearchParams({ q: ui.q ?? '', sort: ui.sort ?? 'recent', cats: (Array.isArray(ui.cats) ? ui.cats : []).join(','), lang: ui.lang ?? 'PT', count: String(Number.isFinite(ui.count) && ui.count > 0 ? ui.count : 9) });
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const splitCategories = (cats?: string): string[] => {
    if (!cats) return [];
    return cats
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const formatDate = (epochSec: number) => {
    try {
      const d = new Date(epochSec * 1000);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return '';
    }
  };

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlightText = (text: string, term: string): React.ReactNode => {
    if (!term) return text;
    try {
      const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, 'ig'));
      return parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    } catch {
      return text;
    }
  };

  const estimateReadingMinutes = (body?: string): number => {
    if (!body) return 1;
    const words = body.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const filteredSorted = useMemo(() => {
    const byQuery = (n: NewsArticle) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        (n.title?.toLowerCase() ?? '').includes(q) ||
        (n.body?.toLowerCase() ?? '').includes(q)
      );
    };
    const arr = itemsAll.filter(byQuery);
    arr.sort((a, b) =>
      sort === 'recent' ? b.publishedAt - a.publishedAt : a.publishedAt - b.publishedAt
    );
    return arr;
  }, [itemsAll, search, sort]);

  const visibleItems = useMemo(
    () => filteredSorted.slice(0, visibleCount),
    [filteredSorted, visibleCount]
  );

  // Proxy simples para imagens externas que podem ser bloqueadas por ORB
  const toProxy = (url?: string): string => {
    if (!url) return '';
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&h=320&fit=cover&output=webp`;
  };
  const fallbackImg = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="160"><rect width="100%" height="100%" fill="#1f2937"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="24">Imagem indisponível</text></svg>'
  );

  return (
    <section className="py-16 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Últimas Notícias</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang('PT')}
              className={`px-3 py-1 rounded border ${lang === 'PT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'}`}
            >
              PT
            </button>
            <button
              onClick={() => setLang('EN')}
              className={`px-3 py-1 rounded border ${lang === 'EN' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'}`}
            >
              EN
            </button>
          </div>
        </div>
        <p className="text-zinc-300 mb-4">
          Acompanhe as notícias do ecossistema cripto. Selecione categorias para filtrar e altere o idioma quando necessário.
        </p>

        {/* Busca e ordenação */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou conteúdo"
            className="w-full md:w-1/2 px-3 py-2 rounded bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2">
            <label className="text-zinc-300">Ordenar:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'recent' | 'oldest')}
              className="px-3 py-2 border border-zinc-700 rounded bg-zinc-900 text-white"
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
            </select>
          </div>
        </div>

        {/* Filtros de categorias */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`text-sm px-3 py-1 rounded-full border ${selectedCategories.includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'}`}
            >
              {cat}
            </button>
          ))}
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-sm px-3 py-1 rounded-full border bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Estados de carregamento e erro */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded border border-zinc-800 p-4 animate-pulse">
                <div className="w-full h-40 bg-zinc-800 rounded" />
                <div className="h-6 bg-zinc-800 rounded mt-4" />
                <div className="h-4 bg-zinc-800 rounded mt-2 w-3/4" />
                <div className="h-4 bg-zinc-800 rounded mt-2 w-2/4" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-950 border border-red-800 text-red-300 rounded">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleItems.map((n) => (
              <article key={n.id} className="bg-zinc-900 rounded overflow-hidden border border-zinc-800">
                {n.imageUrl ? (
                  <img
                    src={toProxy(n.imageUrl)}
                    alt={n.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImg;
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-zinc-800" />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    <Link to={`/noticia/${encodeURIComponent(n.id)}`} state={n} className="hover:underline">
                      {highlightText(n.title, search)}
                    </Link>
                  </h3>
                  <div className="mt-2 text-sm text-zinc-400">
                    <span>{n.source}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(n.publishedAt)}</span>
                    {n.body && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{estimateReadingMinutes(n.body)} min leitura</span>
                      </>
                    )}
                  </div>
                  {n.body && (
                    <p className="mt-3 text-zinc-300 line-clamp-3">{highlightText(n.body, search)}</p>
                  )}
                  {/* Tags/Categorias */}
                  {splitCategories(n.categories).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {splitCategories(n.categories).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 text-indigo-400 hover:text-indigo-300"
                  >
                    Ler no site da fonte
                  </a>
                </div>
              </article>
            ))}
            {filteredSorted.length === 0 && (
              <p className="text-zinc-400">Nenhum artigo encontrado para os filtros selecionados.</p>
            )}
          </div>
        )}

        {!loading && !error && filteredSorted.length > visibleCount && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisibleCount((c) => c + 9)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </section>
  );
}