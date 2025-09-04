import { SvgIconProps, SvgIconTypeMap } from '@mui/material';

import { OverridableComponent } from '@mui/material/OverridableComponent';

export type DrawerPosition = 'left' | 'right';

export interface DrawerComponent {
  id: string;
  component: React.ComponentType<any>;
  icon:
    | (OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
        muiName: string;
      })
    | React.ForwardRefExoticComponent<
        Omit<SvgIconProps, 'ref'> & React.RefAttributes<SVGSVGElement>
      >;
  label: string;
  position: DrawerPosition;
  props?: Record<string, any>;
}

export interface DrawerState {
  isOpen: boolean;
  activeComponentId: string | null;
}
