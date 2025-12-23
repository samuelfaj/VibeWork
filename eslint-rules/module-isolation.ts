import type { Rule } from 'eslint'

const moduleIsolationRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce module isolation: cross-module imports must be from public.ts or public/ folder only',
    },
    schema: [],
    messages: {
      forbiddenImport:
        'Cross-module import violation: Cannot import from "{{importPath}}". ' +
        'Module "{{sourceModule}}" can only import from "{{targetModule}}/public". ' +
        'Move the export to public.ts (small) or public/ folder (large).',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename()

    const modulePattern = /[/\\]modules[/\\]([^/\\]+)/
    const sourceMatch = filename.match(modulePattern)
    const sourceModule = sourceMatch ? sourceMatch[1] : null

    function checkImport(importPath: string, node: Rule.Node) {
      if (!sourceModule) return

      const normalizedPath = importPath.replaceAll('\\', '/')

      const importModuleMatch = normalizedPath.match(/@modules\/([^/]+)(?:\/(.*))?/)

      if (!importModuleMatch) return

      const [, targetModule, subPath] = importModuleMatch

      if (targetModule === sourceModule) return

      // Allow imports from public.ts, public/, or module index (no subPath)
      const isPublicImport =
        !subPath || subPath === 'public.ts' || subPath === 'public' || subPath.startsWith('public/')

      if (!isPublicImport) {
        context.report({
          node,
          messageId: 'forbiddenImport',
          data: {
            importPath,
            sourceModule,
            targetModule: `@modules/${targetModule}`,
          },
        })
      }
    }

    return {
      ImportDeclaration(node) {
        if (node.source?.value) {
          checkImport(node.source.value as string, node)
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source?.value) {
          checkImport(node.source.value as string, node)
        }
      },
      ExportAllDeclaration(node) {
        if (node.source?.value) {
          checkImport(node.source.value as string, node)
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Import' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal'
        ) {
          checkImport(node.arguments[0].value as string, node)
        }
      },
    }
  },
}

export default moduleIsolationRule
