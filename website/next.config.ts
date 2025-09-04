import type { NextConfig } from 'next'
import nextra from 'nextra'
import type { Pluggable } from 'unified'
import { remarkNpm2Yarn } from '@theguild/remark-npm2yarn'
import { globSync } from 'glob'
import { visit } from 'unist-util-visit'
import { Plugin } from 'unified'

/**
 * This plugin overrides the import source for the Tabs component to use the custom component
 * @param tree - The markdown AST
 * @returns The modified markdown AST
 */
const overrideNpm2YarnImports: Plugin = () => {
  return (tree) => {
    // Find and modify the import statements added by remarkNpm2Yarn
    visit(tree, 'mdxjsEsm', (node: any) => {
      if (node.data?.estree?.body) {
        for (const statement of node.data.estree.body) {
          // Look for import declarations from 'nextra/components'
          if (
            statement.type === 'ImportDeclaration' &&
            statement.source.value === 'nextra/components'
          ) {
            // Change the import source to your component
            statement.source.value = '@/components/tabs'
          }
        }
      }
    })

    return tree
  }
}

const withNextra = nextra({
  // ... Other Nextra config options,
  mdxOptions: {
    remarkPlugins: [
      [
        remarkNpm2Yarn, // should be before remarkRemoveImports because contains `import { Tabs as $Tabs, Tab as $Tab } from ...`
        {
          packageName: '@/components/tabs',
          tabNamesProp: 'items',
          storageKey: 'selectedPackageManager',
        },
      ] satisfies Pluggable,
      overrideNpm2YarnImports,
    ],
  },
})

const nextConfig = async (phase: string) => {
  const nextConfig: NextConfig = {}

  if (phase === 'phase-development-server') {
    const fs = await import('node:fs')

    const allFiles = globSync('../packages/*/package.json')

    const packageNames = allFiles
      .map((file: any) => {
        try {
          const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'))
          return packageJson.name
        } catch (error) {
          return null
        }
      })
      .filter((pkg: string) => pkg?.startsWith('@embedpdf'))

    nextConfig.transpilePackages = packageNames
  }

  return nextConfig
}

export default withNextra(nextConfig)
