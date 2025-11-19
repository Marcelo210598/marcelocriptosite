import React, { useState, useEffect, useMemo } from 'react';
import { Filter, TrendingUp, TrendingDown, DollarSign, Activity, Star, X, ChevronDown, ChevronUp } from 'lucide-react';

interface CoinFilters {
  priceRange: [number, number];
  marketCapRange: [number, number];
  volumeRange: [number, number];
  changeRange: [number, number];
  categories: string[];
  sortBy: 'market_cap' | 'volume' | 'price' | 'change' | 'name';
  sortOrder: 'asc' | 'desc';
  showFavoritesOnly: boolean;
  showHighVolume: boolean;
  showGainers: boolean;
  showLosers: boolean;
}

interface AdvancedCoinFiltersProps {
  filters: CoinFilters;
  onFiltersChange: (filters: CoinFilters) => void;
  availableCategories: string[];
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Smart Contract Platform',
  'DeFi',
  'Stablecoin',
  'Exchange Token',
  'Meme',
  'Gaming',
  'NFT',
  'Layer 1',
  'Layer 2',
  'Privacy'
];

const SORT_OPTIONS = [
  { value: 'market_cap', label: 'Capitalização' },
  { value: 'volume', label: 'Volume' },
  { value: 'price', label: 'Preço' },
  { value: 'change', label: 'Mudança %' },
  { value: 'name', label: 'Nome' }
];

export const AdvancedCoinFilters: React.FC<AdvancedCoinFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCategories,
  isOpen,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState<CoinFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    marketCap: true,
    volume: true,
    change: true,
    categories: true,
    advanced: true
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = <K extends keyof CoinFilters>(
    key: K,
    value: CoinFilters[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRangeChange = (
    key: 'priceRange' | 'marketCapRange' | 'volumeRange' | 'changeRange',
    index: 0 | 1,
    value: number
  ) => {
    const newRange: [number, number] = [...localFilters[key]];
    newRange[index] = value;
    handleFilterChange(key, newRange);
  };

  const toggleCategory = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    handleFilterChange('categories', newCategories);
  };

  const resetFilters = () => {
    const defaultFilters: CoinFilters = {
      priceRange: [0, 100000],
      marketCapRange: [0, 1000000000000],
      volumeRange: [0, 10000000000],
      changeRange: [-100, 100],
      categories: [],
      sortBy: 'market_cap',
      sortOrder: 'desc',
      showFavoritesOnly: false,
      showHighVolume: false,
      showGainers: false,
      showLosers: false
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const presetFilters = {
    topGainers: () => {
      handleFilterChange('changeRange', [5, 100]);
      handleFilterChange('sortBy', 'change');
      handleFilterChange('sortOrder', 'desc');
    },
    topLosers: () => {
      handleFilterChange('changeRange', [-100, -5]);
      handleFilterChange('sortBy', 'change');
      handleFilterChange('sortOrder', 'asc');
    },
    highVolume: () => {
      handleFilterChange('volumeRange', [1000000, 10000000000]);
      handleFilterChange('sortBy', 'volume');
      handleFilterChange('sortOrder', 'desc');
    },
    largeCap: () => {
      handleFilterChange('marketCapRange', [1000000000, 1000000000000]);
      handleFilterChange('sortBy', 'market_cap');
      handleFilterChange('sortOrder', 'desc');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros Avançados
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Presets rápidos */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={presetFilters.topGainers}
                className="flex items-center gap-2 p-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Alta
              </button>
              <button
                onClick={presetFilters.topLosers}
                className="flex items-center gap-2 p-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                <TrendingDown className="w-4 h-4" />
                Baixa
              </button>
              <button
                onClick={presetFilters.highVolume}
                className="flex items-center gap-2 p-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Activity className="w-4 h-4" />
                Volume
              </button>
              <button
                onClick={presetFilters.largeCap}
                className="flex items-center gap-2 p-2 text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Large Cap
              </button>
            </div>
          </div>

          {/* Conteúdo scrollável */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Filtros de Preço */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('price')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white"
              >
                <span>Preço</span>
                {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.price && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mínimo</label>
                      <input
                        type="number"
                        value={localFilters.priceRange[0]}
                        onChange={(e) => handleRangeChange('priceRange', 0, Number(e.target.value))}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Máximo</label>
                      <input
                        type="number"
                        value={localFilters.priceRange[1]}
                        onChange={(e) => handleRangeChange('priceRange', 1, Number(e.target.value))}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filtros de Capitalização */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('marketCap')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white"
              >
                <span>Capitalização</span>
                {expandedSections.marketCap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.marketCap && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mínima</label>
                      <input
                        type="number"
                        value={localFilters.marketCapRange[0]}
                        onChange={(e) => handleRangeChange('marketCapRange', 0, Number(e.target.value))}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Máxima</label>
                      <input
                        type="number"
                        value={localFilters.marketCapRange[1]}
                        onChange={(e) => handleRangeChange('marketCapRange', 1, Number(e.target.value))}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filtros de Volume */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('volume')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white"
              >
                <span>Volume</span>
                {expandedSections.volume ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.volume && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mínimo</label>
                      <input
                        type="number"
                        value={localFilters.volumeRange[0]}
                        onChange={(e) => handleRangeChange('volumeRange', 0, Number(e.target.value))}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Máximo</label>
                      <input
                        type="number"
                        value={localFilters.volumeRange[1]}
                        onChange={(e) => handleRangeChange('volumeRange', 1, Number(e.target.value))}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filtros de Mudança % */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('change')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white"
              >
                <span>Mudança %</span>
                {expandedSections.change ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.change && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mínima</label>
                      <input
                        type="number"
                        value={localFilters.changeRange[0]}
                        onChange={(e) => handleRangeChange('changeRange', 0, Number(e.target.value))}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Máxima</label>
                      <input
                        type="number"
                        value={localFilters.changeRange[1]}
                        onChange={(e) => handleRangeChange('changeRange', 1, Number(e.target.value))}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categorias */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white"
              >
                <span>Categorias</span>
                {expandedSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.categories && (
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        localFilters.categories.includes(category)
                          ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filtros Avançados */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('advanced')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white"
              >
                <span>Avançado</span>
                {expandedSections.advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.advanced && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters.showFavoritesOnly}
                      onChange={(e) => handleFilterChange('showFavoritesOnly', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Apenas favoritas</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters.showHighVolume}
                      onChange={(e) => handleFilterChange('showHighVolume', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alto volume</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters.showGainers}
                      onChange={(e) => handleFilterChange('showGainers', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Apenas altas</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters.showLosers}
                      onChange={(e) => handleFilterChange('showLosers', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Apenas baixas</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Limpar Tudo
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para usar filtros de moedas
export const useCoinFilters = () => {
  const [filters, setFilters] = useState<CoinFilters>({
    priceRange: [0, 100000],
    marketCapRange: [0, 1000000000000],
    volumeRange: [0, 10000000000],
    changeRange: [-100, 100],
    categories: [],
    sortBy: 'market_cap',
    sortOrder: 'desc',
    showFavoritesOnly: false,
    showHighVolume: false,
    showGainers: false,
    showLosers: false
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const openFilters = () => setIsFilterOpen(true);
  const closeFilters = () => setIsFilterOpen(false);

  return {
    filters,
    setFilters,
    isFilterOpen,
    openFilters,
    closeFilters
  };
};