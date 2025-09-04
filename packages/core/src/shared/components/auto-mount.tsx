import { Fragment, useMemo, ComponentType, ReactNode } from '@framework';
import { hasAutoMountElements } from '@embedpdf/core';
import type { PluginBatchRegistration, IPlugin } from '@embedpdf/core';

interface AutoMountProps {
  plugins: PluginBatchRegistration<IPlugin<any>, any>[];
  children: ReactNode;
}

export function AutoMount({ plugins, children }: AutoMountProps) {
  const { utilities, wrappers } = useMemo(() => {
    // React-specific types for internal use
    const utilities: ComponentType[] = [];
    const wrappers: ComponentType<{ children: ReactNode }>[] = [];

    for (const reg of plugins) {
      const pkg = reg.package;
      if (hasAutoMountElements(pkg)) {
        const elements = pkg.autoMountElements() || [];

        for (const element of elements) {
          if (element.type === 'utility') {
            utilities.push(element.component);
          } else if (element.type === 'wrapper') {
            // In React context, we know wrappers need children
            wrappers.push(element.component);
          }
        }
      }
    }
    return { utilities, wrappers };
  }, [plugins]);

  // React-specific wrapping logic
  const wrappedContent = wrappers.reduce(
    (content, Wrapper) => <Wrapper>{content}</Wrapper>,
    children,
  );

  return (
    <Fragment>
      {wrappedContent}
      {utilities.map((Utility, i) => (
        <Utility key={`utility-${i}`} />
      ))}
    </Fragment>
  );
}
