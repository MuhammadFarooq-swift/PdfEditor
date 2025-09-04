import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

import { DrawerComponent, DrawerPosition, DrawerState } from './types';
import { useIsMobile } from '../../hooks/use-is-mobile';

interface DrawerProviderProps {
  children: React.ReactNode;
  components: DrawerComponent[];
}

interface DrawerContextType {
  registeredComponents: DrawerComponent[];
  drawerStates: Record<DrawerPosition, DrawerState>;
  showComponent: (id: string) => void;
  hideComponent: (position: DrawerPosition) => void;
  getActiveComponent: (position: DrawerPosition) => DrawerComponent | null;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

export const DrawerProvider: React.FC<DrawerProviderProps> = ({ children, components }) => {
  const isMobile = useIsMobile();

  const [drawerStates, setDrawerStates] = useState<Record<DrawerPosition, DrawerState>>({
    left: { isOpen: false, activeComponentId: null },
    right: { isOpen: false, activeComponentId: null },
  });

  // Registered components are now static, from props
  const registeredComponents = useMemo(() => components, [components]);

  const showComponent = useCallback(
    (id: string) => {
      const component = registeredComponents.find((c) => c.id === id);
      if (!component) return;

      setDrawerStates((prev) => {
        // If we’re on mobile, close every drawer first
        if (isMobile) {
          return {
            left: { isOpen: false, activeComponentId: null },
            right: { isOpen: false, activeComponentId: null },
            [component.position]: { isOpen: true, activeComponentId: id },
          };
        }

        // desktop behaviour (unchanged)
        return {
          ...prev,
          [component.position]: { isOpen: true, activeComponentId: id },
        };
      });
    },
    [registeredComponents, isMobile],
  );

  const hideComponent = useCallback((position: DrawerPosition) => {
    setDrawerStates((prev) => ({
      ...prev,
      [position]: {
        isOpen: false,
        activeComponentId: null,
      },
    }));
  }, []);

  const getActiveComponent = useCallback(
    (position: DrawerPosition) => {
      const activeId = drawerStates[position].activeComponentId;
      return registeredComponents.find((comp) => comp.id === activeId) || null;
    },
    [drawerStates, registeredComponents],
  );

  return (
    <DrawerContext.Provider
      value={{
        registeredComponents,
        drawerStates,
        showComponent,
        hideComponent,
        getActiveComponent,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
