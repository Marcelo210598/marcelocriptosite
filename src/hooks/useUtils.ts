import { useState, useEffect, useCallback, useMemo } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useSearch<T>(items: T[], searchKey: keyof T | ((item: T) => string)) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)

  const getSearchText = useCallback((item: T): string => {
    if (typeof searchKey === 'function') {
      return searchKey(item)
    }
    return String(item[searchKey] || '')
  }, [searchKey])

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items
    
    const query = debouncedQuery.toLowerCase()
    return items.filter(item => 
      getSearchText(item).toLowerCase().includes(query)
    )
  }, [items, debouncedQuery, getSearchText])

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    isSearching: searchQuery !== debouncedQuery
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}