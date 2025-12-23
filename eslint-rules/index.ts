import type { ESLint } from 'eslint'
import maxCommentLines from './max-comment-lines'
import moduleIsolation from './module-isolation'
import noJsdoc from './no-jsdoc'
import softMaxLines from './soft-max-lines'

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-local',
    version: '1.0.0',
  },
  rules: {
    'max-comment-lines': maxCommentLines,
    'module-isolation': moduleIsolation,
    'no-jsdoc': noJsdoc,
    'soft-max-lines': softMaxLines,
  },
}

export default plugin
