import type { Rule } from 'eslint'

const JSDOC_TAGS = [
  '@param',
  '@returns',
  '@return',
  '@type',
  '@typedef',
  '@callback',
  '@template',
  '@extends',
  '@implements',
  '@augments',
  '@class',
  '@constructor',
  '@function',
  '@method',
  '@property',
  '@prop',
  '@member',
  '@memberof',
  '@namespace',
  '@module',
  '@exports',
  '@throws',
  '@exception',
  '@yields',
  '@async',
  '@generator',
  '@override',
  '@readonly',
  '@abstract',
  '@virtual',
  '@private',
  '@protected',
  '@public',
  '@internal',
  '@deprecated',
  '@beta',
  '@alpha',
  '@experimental',
  '@see',
  '@link',
  '@example',
  '@default',
  '@defaultValue',
  '@enum',
  '@event',
  '@fires',
  '@emits',
  '@listens',
  '@borrows',
  '@lends',
  '@alias',
  '@inheritdoc',
  '@description',
  '@remarks',
  '@packageDocumentation',
]

const noJsdocRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow JSDoc and TSDoc style comments',
      recommended: false,
    },
    schema: [],
    messages: {
      noJsdoc:
        'JSDoc/TSDoc comments are not allowed. Use TypeScript types instead of documentation comments.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    return {
      Program() {
        const comments = sourceCode.getAllComments()

        for (const comment of comments) {
          if (comment.type === 'Block') {
            const content = comment.value
            const isJsdoc = JSDOC_TAGS.some((tag) => content.includes(tag))

            if (isJsdoc) {
              context.report({
                loc: comment.loc!,
                messageId: 'noJsdoc',
              })
            }
          }
        }
      },
    }
  },
}

export default noJsdocRule
