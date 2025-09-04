import { MDXComponents } from 'mdx/types'
import { useMDXComponents as getDocsMDXComponents } from '@/components/mdx-components' // nextra-theme-blog or your custom theme

// Get the default MDX components
const docsComponents = getDocsMDXComponents()

export const useMDXComponents: typeof getDocsMDXComponents = (components) => ({
  ...docsComponents,
  ...components,
})
