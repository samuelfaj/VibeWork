export default {
  // TypeScript/JavaScript files
  '*.{ts,tsx,js,jsx}': ['eslint --fix --cache', 'prettier --write'],

  // JSON, YAML, Markdown
  '*.{json,yaml,yml,md}': ['prettier --write'],

  // CSS/SCSS
  '*.{css,scss}': ['prettier --write'],
}
