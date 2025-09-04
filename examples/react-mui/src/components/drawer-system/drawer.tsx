import { Box, IconButton, Drawer as MuiDrawer, DrawerProps as MuiDrawerProps } from '@mui/material';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import CloseIcon from '@mui/icons-material/Close';
import React, { useRef, useState } from 'react';

import { useDrawer } from './drawer-context';
import { DrawerPosition } from './types';
import { useIsMobile } from '../../hooks/use-is-mobile';

interface DrawerProps extends Omit<MuiDrawerProps, 'anchor' | 'variant'> {
  position: DrawerPosition;
  width?: number;
}

export const Drawer: React.FC<DrawerProps> = ({ position, width = 280, ...muiDrawerProps }) => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false); // 50 vh  →  100 vh
  const startY = useRef<number | null>(null);

  const beginDrag = (y: number) => (startY.current = y);
  const moveDrag = (y: number) => {
    if (startY.current == null) return;
    const delta = y - startY.current;
    if (delta < -50) {
      // dragged ≥ 50 px up
      setExpanded(true);
      startY.current = null;
    } else if (delta > 50) {
      // dragged ≥ 50 px down
      setExpanded(false);
      startY.current = null;
    }
  };
  const endDrag = () => (startY.current = null);

  const { drawerStates, getActiveComponent, hideComponent } = useDrawer();
  const { isOpen } = drawerStates[position];
  const activeComponent = getActiveComponent(position);
  const ActiveComponent = activeComponent?.component;

  /* ──────────────── MOBILE BOTTOM-SHEET ──────────────── */
  if (isMobile) {
    const paperSx = {
      height: expanded ? '100vh' : '50vh',
      overflow: 'visible',
      touchAction: 'none', // smoother drag on mobile
    };

    return (
      <SwipeableDrawer
        anchor="bottom"
        open={isOpen}
        onClose={() => hideComponent(position)}
        onOpen={() => {
          /* already open at half-sheet */
        }}
        disableDiscovery
        slotProps={{ paper: { sx: paperSx } }}
      >
        {/* ── Grab-handle & close-button ───────────────── */}
        <Box
          sx={{ display: 'flex', justifyContent: 'center', py: 1, position: 'relative' }}
          onTouchStart={(e) => e.touches[0] && beginDrag(e.touches[0].clientY)}
          onTouchMove={(e) => e.touches[0] && moveDrag(e.touches[0].clientY)}
          onTouchEnd={endDrag}
          onMouseDown={(e) => beginDrag(e.clientY)}
          onMouseMove={(e) => moveDrag(e.clientY)}
          onMouseUp={endDrag}
        >
          <Box sx={{ width: 32, height: 4, bgcolor: 'text.disabled', borderRadius: 2 }} />
          <IconButton
            size="small"
            onClick={() => hideComponent(position)}
            sx={{ position: 'absolute', right: 8, top: 0 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Drawer content ──────────────────────────── */}
        <Box sx={{ px: 2, pb: 2, height: 'calc(100% - 32px)', overflow: 'auto' }}>
          {ActiveComponent && <ActiveComponent {...activeComponent.props} />}
        </Box>
      </SwipeableDrawer>
    );
  }

  /* ──────────────── DESKTOP SIDE DRAWERS ──────────────── */
  return (
    <MuiDrawer
      variant="persistent"
      anchor={position}
      open={isOpen}
      slotProps={{
        paper: {
          sx: {
            width,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            transition: 'none !important',
          },
        },
      }}
      sx={{
        width: isOpen ? width : 0,
        flexShrink: 0,
        transition: 'none',
      }}
      {...muiDrawerProps}
    >
      {ActiveComponent && <ActiveComponent {...activeComponent.props} />}
    </MuiDrawer>
  );
};
