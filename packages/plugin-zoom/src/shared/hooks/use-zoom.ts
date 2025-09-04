import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { initialState, ZoomPlugin, ZoomState } from '@embedpdf/plugin-zoom';
import { useEffect, useState } from '@framework';

export const useZoomCapability = () => useCapability<ZoomPlugin>(ZoomPlugin.id);
export const useZoomPlugin = () => usePlugin<ZoomPlugin>(ZoomPlugin.id);

export const useZoom = () => {
  const { provides } = useZoomCapability();
  const [state, setState] = useState<ZoomState>(initialState);

  useEffect(() => {
    return provides?.onStateChange((action) => {
      setState(action);
    });
  }, [provides]);

  return {
    state,
    provides,
  };
};
