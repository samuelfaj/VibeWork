import type { Rule } from 'eslint'

const maxCommentLinesRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum number of lines in block comments',
      recommended: false,
    },
    schema: [
      {
        type: 'integer',
        minimum: 1,
        default: 3,
      },
    ],
    messages: {
      tooManyLines:
        'Block comment has {{actual}} lines but maximum allowed is {{max}}. Keep comments concise.',
    },
  },
  create(context) {
    const maxLines = (context.options[0] as number) ?? 3
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    return {
      Program() {
        const comments = sourceCode.getAllComments()

        for (const comment of comments) {
          if (comment.type === 'Block') {
            const lines = comment.value.split('\n')
            const lineCount = lines.length

            if (lineCount > maxLines) {
              context.report({
                loc: comment.loc!,
                messageId: 'tooManyLines',
                data: {
                  actual: String(lineCount),
                  max: String(maxLines),
                },
              })
            }
          }
        }
      },
    }
  },
}

export default maxCommentLinesRule
