import {
  IconButtonProps as MuiIconButtonProps,
  IconButton as MuiIconButton,
  alpha,
} from '@mui/material';

interface ToggleIconButtonProps extends MuiIconButtonProps {
  isOpen: boolean;
  // Extend with MUI's IconButton props if needed
  children: React.ReactNode;
}

export const ToggleIconButton: React.FC<ToggleIconButtonProps> = ({
  isOpen,
  children,
  ...props
}) => {
  return (
    <MuiIconButton
      edge="start"
      size={'small'}
      aria-label="toggle search"
      aria-pressed={isOpen}
      {...props}
      sx={{
        bgcolor: isOpen ? (theme) => alpha(theme.palette.common.white, 0.24) : 'transparent',
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.common.white, 0.16),
        },
        transition: 'background-color 120ms',
        color: 'white',
        ...props.sx,
      }}
    >
      {children}
    </MuiIconButton>
  );
};
