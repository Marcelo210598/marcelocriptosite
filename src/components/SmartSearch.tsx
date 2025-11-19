import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, Filter, TrendingUp, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'coin' | 'news' | 'analysis';
  title: string;
  description: string;
  symbol?: string;
  image?: string;
  price?: number;
  change?: number;
  date?: string;
  relevance: number;
}

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  results: number;
}

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect: (result: SearchResult) => void;
}

// Dados mock para demonstração
const mockData: SearchResult[] = [
  {
    id: 'bitcoin',
    type: 'coin',
    title: 'Bitcoin',
    description: 'A primeira e maior criptomoeda por capitalização de mercado',
    symbol: 'BTC',
    price: 43250.00,
    change: 2.5,
    relevance: 0.95
  },
  {
    id: 'ethereum',
    type: 'coin',
    title: 'Ethereum',
    description: 'Plataforma de contratos inteligentes e segunda maior criptomoeda',
    symbol: 'ETH',
    price: 2580.00,
    change: -1.2,
    relevance: 0.90
  },
  {
    id: 'cardano',
    type: 'coin',
    title: 'Cardano',
    description: 'Blockchain de terceira geração focada em sustentabilidade',
    symbol: 'ADA',
    price: 0.48,
    change: 5.8,
    relevance: 0.85
  },
  {
    id: 'news-1',
    type: 'news',
    title: 'Bitcoin atinge novo máximo em 2024',
    description: 'Análise do recente aumento do Bitcoin e suas implicações para o mercado',
    date: '2024-01-15',
    relevance: 0.80
  },
  {
    id: 'analysis-1',
    type: 'analysis',
    title: 'Análise Técnica: Ethereum em tendência de alta',
    description: 'Estudo técnico completo sobre o movimento ascendente do ETH',
    date: '2024-01-14',
    relevance: 0.75
  }
];

export const SmartSearch: React.FC<SmartSearchProps> = ({ 
  isOpen, 
  onClose, 
  onResultSelect 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'coin' | 'news' | 'analysis',
    sortBy: 'relevance' as 'relevance' | 'date' | 'price' | 'change'
  });
  const navigate = useNavigate();

  // Carregar histórico de busca do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.warn('Erro ao carregar histórico de busca:', error);
      }
    }
  }, []);

  // Salvar histórico de busca
  const saveSearchHistory = useCallback((query: string, resultsCount: number) => {
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      results: resultsCount
    };
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query !== query);
      const updated = [newItem, ...filtered].slice(0, 10); // Manter últimas 10 buscas
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Algoritmo de busca inteligente com múltiplos critérios
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simular delay de busca
    await new Promise(resolve => setTimeout(resolve, 300));

    const searchTerms = searchQuery.toLowerCase().split(' ');
    
    const filteredResults = mockData.filter(item => {
      // Busca por termos no título e descrição
      const searchableText = `${item.title} ${item.description} ${item.symbol || ''}`.toLowerCase();
      const matchesTerms = searchTerms.every(term => searchableText.includes(term));
      
      // Filtro por tipo
      const matchesType = filters.type === 'all' || item.type === filters.type;
      
      return matchesTerms && matchesType;
    });

    // Ordenar resultados
    const sortedResults = filteredResults.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'change':
          return (b.change || 0) - (a.change || 0);
        case 'relevance':
        default:
          return b.relevance - a.relevance;
      }
    });

    setResults(sortedResults);
    saveSearchHistory(searchQuery, sortedResults.length);
    setIsSearching(false);
  }, [filters, saveSearchHistory]);

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Sugestões baseadas no histórico e tendências
  const getSuggestions = useMemo(() => {
    const recentSearches = searchHistory.slice(0, 5);
    const trendingSearches = ['Bitcoin', 'Ethereum', 'Cardano', 'Solana', 'Polkadot'];
    
    return {
      recent: recentSearches.map(item => item.query),
      trending: trendingSearches
    };
  }, [searchHistory]);

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
    onClose();
    
    // Navegar para a página apropriada
    switch (result.type) {
      case 'coin':
        navigate(`/moeda/${result.id}`);
        break;
      case 'news':
        navigate(`/noticia/${result.id}`);
        break;
      case 'analysis':
        navigate(`/analises`);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[80vh] overflow-hidden">
          {/* Header da Busca */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar moedas, notícias, análises..."
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">Todos</option>
                      <option value="coin">Moedas</option>
                      <option value="news">Notícias</option>
                      <option value="analysis">Análises</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="relevance">Relevância</option>
                      <option value="date">Data</option>
                      <option value="price">Preço</option>
                      <option value="change">Mudança</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conteúdo da Busca */}
          <div className="overflow-y-auto max-h-[60vh]">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Buscando...</p>
              </div>
            ) : query ? (
              <div className="p-4">
                {results.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {results.length} resultado(s) encontrados
                    </div>
                    {results.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                result.type === 'coin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                result.type === 'news' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              }`}>
                                {result.type === 'coin' ? 'Moeda' : result.type === 'news' ? 'Notícia' : 'Análise'}
                              </span>
                              {result.symbol && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                  {result.symbol}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {result.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {result.description}
                            </p>
                            {result.type === 'coin' && result.price && (
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ${result.price.toLocaleString()}
                                </span>
                                {result.change && (
                                  <span className={`font-medium ${
                                    result.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {result.change >= 0 ? '+' : ''}{result.change.toFixed(2)}%
                                  </span>
                                )}
                              </div>
                            )}
                            {result.date && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <Clock className="w-3 h-3" />
                                {new Date(result.date).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhum resultado encontrado para "{query}"
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Tente buscar por nomes de moedas, símbolos ou palavras-chave
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                {/* Sugestões de busca */}
                <div className="space-y-6">
                  {getSuggestions.recent.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Buscas Recentes
                        </h4>
                        <button
                          onClick={clearSearchHistory}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Limpar
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getSuggestions.recent.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4" />
                      Em Alta
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getSuggestions.trending.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para usar a busca inteligente
export const useSmartSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const handleResultSelect = (result: SearchResult) => {
    console.log('Resultado selecionado:', result);
  };

  return {
    isSearchOpen,
    openSearch,
    closeSearch,
    handleResultSelect
  };
};