import { describe, it, expect, beforeAll } from 'vitest'
import { parseAcceptLanguage, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../middleware'
import { initI18n } from '../index'

beforeAll(async () => {
  await initI18n()
})

describe('parseAcceptLanguage', () => {
  it('returns "en" for Accept-Language "en"', () => {
    expect(parseAcceptLanguage('en')).toBe('en')
  })

  it('returns "pt-BR" for Accept-Language "pt-BR"', () => {
    expect(parseAcceptLanguage('pt-BR')).toBe('pt-BR')
  })

  it('returns "pt-BR" for Accept-Language "pt-BR,pt;q=0.9,en;q=0.8"', () => {
    expect(parseAcceptLanguage('pt-BR,pt;q=0.9,en;q=0.8')).toBe('pt-BR')
  })

  it('returns "en" for unsupported locales "fr,de"', () => {
    expect(parseAcceptLanguage('fr,de')).toBe('en')
  })

  it('returns "en" for null header', () => {
    expect(parseAcceptLanguage(null)).toBe('en')
  })

  it('returns "en" for wildcard "*"', () => {
    expect(parseAcceptLanguage('*')).toBe('en')
  })

  it('returns "en" for malformed header', () => {
    expect(parseAcceptLanguage('invalid;;;')).toBe('en')
  })

  it('returns "pt-BR" for quality value "en;q=0.5,pt-BR;q=0.9"', () => {
    expect(parseAcceptLanguage('en;q=0.5,pt-BR;q=0.9')).toBe('pt-BR')
  })

  it('returns "pt-BR" for "pt" language code', () => {
    expect(parseAcceptLanguage('pt')).toBe('pt-BR')
  })

  it('returns "en" for "en-US" language code', () => {
    expect(parseAcceptLanguage('en-US')).toBe('en')
  })
})

describe('SUPPORTED_LOCALES', () => {
  it('contains en and pt-BR', () => {
    expect(SUPPORTED_LOCALES).toContain('en')
    expect(SUPPORTED_LOCALES).toContain('pt-BR')
  })
})

describe('DEFAULT_LOCALE', () => {
  it('is "en"', () => {
    expect(DEFAULT_LOCALE).toBe('en')
  })
})
