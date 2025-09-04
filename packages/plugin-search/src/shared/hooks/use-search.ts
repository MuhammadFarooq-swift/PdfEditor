import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { SearchPlugin, SearchState } from '@embedpdf/plugin-search';
import { useEffect, useState } from '@framework';

export const useSearchPlugin = () => usePlugin<SearchPlugin>(SearchPlugin.id);
export const useSearchCapability = () => useCapability<SearchPlugin>(SearchPlugin.id);

export const useSearch = () => {
  const { provides } = useSearchCapability();
  const [searchState, setSearchState] = useState<SearchState>({
    flags: [],
    results: [],
    total: 0,
    activeResultIndex: 0,
    showAllResults: true,
    query: '',
    loading: false,
    active: false,
  });

  useEffect(() => {
    return provides?.onStateChange((state) => setSearchState(state));
  }, [provides]);

  return {
    state: searchState,
    provides,
  };
};
