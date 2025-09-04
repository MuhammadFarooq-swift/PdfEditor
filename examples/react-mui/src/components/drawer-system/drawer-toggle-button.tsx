import { useDrawer } from './drawer-context';
import { ToggleIconButton } from '../toggle-icon-button';

interface DrawerToggleButtonProps {
  componentId: string;
}

export const DrawerToggleButton: React.FC<DrawerToggleButtonProps> = ({ componentId }) => {
  const { drawerStates, showComponent, hideComponent, registeredComponents } = useDrawer();
  const component = registeredComponents.find((comp) => comp.id === componentId);

  if (!component) return null;

  const { isOpen, activeComponentId } = drawerStates[component.position];
  const isThisComponentOpen = isOpen && activeComponentId === componentId;

  const Icon = component.icon;

  const handleToggle = () => {
    if (isThisComponentOpen) {
      hideComponent(component.position);
    } else {
      showComponent(componentId);
    }
  };

  return (
    <ToggleIconButton
      isOpen={isThisComponentOpen}
      onClick={handleToggle}
      aria-label={`Toggle ${component.label}`}
    >
      <Icon fontSize="small" />
    </ToggleIconButton>
  );
};
