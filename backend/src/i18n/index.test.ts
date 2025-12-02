import { describe, it, expect, beforeAll } from 'vitest'
import { initI18n, t, getLanguageFromHeader } from './index'

describe('i18n', () => {
  beforeAll(async () => {
    await initI18n()
  })

  describe('t()', () => {
    it('returns English string by default', () => {
      expect(t('errors.generic.serverError')).toBe('Internal server error')
      expect(t('health.ok')).toBe('OK')
    })

    it('returns Portuguese string with lng: pt-BR', () => {
      expect(t('errors.generic.serverError', { lng: 'pt-BR' })).toBe('Erro interno do servidor')
      expect(t('health.ok', { lng: 'pt-BR' })).toBe('OK')
    })

    it('returns Spanish string with lng: es', () => {
      expect(t('errors.generic.serverError', { lng: 'es' })).toBe('Error interno del servidor')
      expect(t('health.ok', { lng: 'es' })).toBe('OK')
    })

    it('falls back to English for unknown language', () => {
      expect(t('errors.generic.serverError', { lng: 'de' })).toBe('Internal server error')
      expect(t('errors.generic.serverError', { lng: 'fr' })).toBe('Internal server error')
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
      expect(getLanguageFromHeader('es')).toBe('es')
    })

    it('parses pt language and returns pt-BR', () => {
      expect(getLanguageFromHeader('pt')).toBe('pt-BR')
    })

    it('parses complex header with quality values', () => {
      expect(getLanguageFromHeader('en-US,en;q=0.9,pt-BR;q=0.8')).toBe('en')
      expect(getLanguageFromHeader('pt-BR,pt;q=0.9,en;q=0.8')).toBe('pt-BR')
      expect(getLanguageFromHeader('es-ES,es;q=0.9,en;q=0.8')).toBe('es')
    })

    it('respects quality values ordering', () => {
      expect(getLanguageFromHeader('en;q=0.5,pt-BR;q=0.9')).toBe('pt-BR')
      expect(getLanguageFromHeader('en;q=0.5,es;q=0.9')).toBe('es')
    })

    it('returns en for unknown languages', () => {
      expect(getLanguageFromHeader('de,fr')).toBe('en')
    })
  })
})
