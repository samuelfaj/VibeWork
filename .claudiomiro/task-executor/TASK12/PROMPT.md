## PROMPT
Configure Semantic Release for automated versioning and changelog generation. Integrate with Conventional Commits for version bumping based on commit types.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/.releaserc.js`

### Patterns to Follow

**Semantic Release config:**
```javascript
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: false }],
    ['@semantic-release/git', {
      assets: ['CHANGELOG.md', 'package.json'],
      message: 'chore(release): ${nextRelease.version} [skip ci]'
    }]
  ]
}
```

### Integration Points
- Uses Conventional Commits from TASK2
- Generates CHANGELOG.md
- Bumps version in package.json

## EXTRA DOCUMENTATION
- Semantic Release: https://semantic-release.gitbook.io/

## LAYER
6

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- npmPublish: false (private repo)
- Main branch only for releases
- Skip CI on release commits
