import { describe, it, expect, beforeAll } from 'vitest'
import { initI18n, t, getLanguageFromHeader } from '../index'

describe('i18n', () => {
  beforeAll(async () => {
    await initI18n()
  })

  describe('t()', () => {
    it('returns English string by default', () => {
      expect(t('errors.validation')).toBe('Validation error')
      expect(t('health.ok')).toBe('OK')
    })

    it('returns Portuguese string with lng: pt-BR', () => {
      expect(t('errors.validation', { lng: 'pt-BR' })).toBe('Erro de validação')
      expect(t('health.ok', { lng: 'pt-BR' })).toBe('OK')
    })

    it('falls back to English for unknown language', () => {
      expect(t('errors.validation', { lng: 'de' })).toBe('Validation error')
      expect(t('errors.validation', { lng: 'fr' })).toBe('Validation error')
    })
  })

  describe('getLanguageFromHeader()', () => {
    it('returns en for null/undefined', () => {
      expect(getLanguageFromHeader(null)).toBe('en')
      expect(getLanguageFromHeader(undefined)).toBe('en')
    })

    it('returns en for empty string', () => {
      expect(getLanguageFromHeader('')).toBe('en')
    })

    it('parses simple language header', () => {
      expect(getLanguageFromHeader('en')).toBe('en')
      expect(getLanguageFromHeader('pt-BR')).toBe('pt-BR')
    })

    it('parses pt language and returns pt-BR', () => {
      expect(getLanguageFromHeader('pt')).toBe('pt-BR')
    })

    it('parses complex header with quality values', () => {
      expect(getLanguageFromHeader('en-US,en;q=0.9,pt-BR;q=0.8')).toBe('en')
      expect(getLanguageFromHeader('pt-BR,pt;q=0.9,en;q=0.8')).toBe('pt-BR')
    })

    it('respects quality values ordering', () => {
      expect(getLanguageFromHeader('en;q=0.5,pt-BR;q=0.9')).toBe('pt-BR')
    })

    it('returns en for unknown languages', () => {
      expect(getLanguageFromHeader('de,fr')).toBe('en')
    })
  })
})
