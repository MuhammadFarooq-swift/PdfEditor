import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { SpreadMode, SpreadPlugin } from '@embedpdf/plugin-spread';
import { useEffect, useState } from '@framework';

export const useSpreadPlugin = () => usePlugin<SpreadPlugin>(SpreadPlugin.id);
export const useSpreadCapability = () => useCapability<SpreadPlugin>(SpreadPlugin.id);

export const useSpread = () => {
  const { provides: spreadProvider } = useSpreadCapability();
  const [spreadMode, setSpreadMode] = useState<SpreadMode>(SpreadMode.None);

  useEffect(() => {
    return spreadProvider?.onSpreadChange((spreadMode) => {
      setSpreadMode(spreadMode);
    });
  }, [spreadProvider]);

  return {
    provides: spreadProvider,
    spreadMode,
  };
};
