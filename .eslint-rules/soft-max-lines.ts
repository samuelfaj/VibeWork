import type { Rule } from 'eslint'

interface Options {
  max?: number
  skipBlankLines?: boolean
  skipComments?: boolean
}

const softMaxLinesRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Soft limit for file lines (warning only)',
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: { type: 'integer', minimum: 1 },
          skipBlankLines: { type: 'boolean' },
          skipComments: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      exceed:
        'File has too many lines ({{actual}}). Recommended max is {{max}} lines. Consider splitting into smaller files.',
    },
  },
  create(context) {
    const options = (context.options[0] as Options) || {}
    const max = options.max || 400
    const skipBlankLines = options.skipBlankLines || false
    const skipComments = options.skipComments || false

    const sourceCode = context.sourceCode || context.getSourceCode()

    return {
      'Program:exit'() {
        let lineCount = sourceCode.lines.length

        if (skipBlankLines || skipComments) {
          const comments = sourceCode.getAllComments()
          const commentLineNumbers = new Set<number>()

          if (skipComments) {
            for (const comment of comments) {
              for (let i = comment.loc!.start.line; i <= comment.loc!.end.line; i++) {
                commentLineNumbers.add(i)
              }
            }
          }

          lineCount = 0
          for (let i = 0; i < sourceCode.lines.length; i++) {
            const lineNumber = i + 1
            const line = sourceCode.lines[i]
            const isBlank = line.trim() === ''
            const isComment = commentLineNumbers.has(lineNumber)

            if (skipBlankLines && isBlank) continue
            if (skipComments && isComment) continue

            lineCount++
          }
        }

        if (lineCount > max) {
          context.report({
            loc: { line: 1, column: 0 },
            messageId: 'exceed',
            data: { actual: String(lineCount), max: String(max) },
          })
        }
      },
    }
  },
}

export default softMaxLinesRule
