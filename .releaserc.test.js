import { describe, it, expect } from 'vitest'
import config from './.releaserc.js'

describe('.releaserc.js configuration', () => {
  it('should have correct branches configuration', () => {
    expect(config.branches).toEqual(['main'])
  })

  it('should have plugins in correct order', () => {
    const pluginNames = config.plugins.map((p) => (Array.isArray(p) ? p[0] : p))
    expect(pluginNames).toEqual([
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/changelog',
      '@semantic-release/npm',
      '@semantic-release/git',
    ])
  })

  it('should disable npm publish', () => {
    const npmPlugin = config.plugins.find(
      (p) => Array.isArray(p) && p[0] === '@semantic-release/npm'
    )
    expect(npmPlugin).toBeDefined()
    expect(npmPlugin[1].npmPublish).toBe(false)
  })

  it('should configure git plugin with correct assets', () => {
    const gitPlugin = config.plugins.find(
      (p) => Array.isArray(p) && p[0] === '@semantic-release/git'
    )
    expect(gitPlugin).toBeDefined()
    expect(gitPlugin[1].assets).toContain('CHANGELOG.md')
    expect(gitPlugin[1].assets).toContain('package.json')
  })

  it('should configure git commit message with [skip ci]', () => {
    const gitPlugin = config.plugins.find(
      (p) => Array.isArray(p) && p[0] === '@semantic-release/git'
    )
    expect(gitPlugin).toBeDefined()
    expect(gitPlugin[1].message).toContain('[skip ci]')
  })
})
