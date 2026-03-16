import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateTime, formatFileSize, formatPercentage, formatNumeroFascicolo, truncate, capitalize, slugify } from '../formatters'

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1234,56')
  })
  it('formats zero', () => {
    expect(formatCurrency(0)).toContain('0,00')
  })
  it('formats negative amounts', () => {
    expect(formatCurrency(-500)).toContain('500,00')
  })
})

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2025-03-15')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/03|mar/i)
  })
})

describe('formatDateTime', () => {
  it('formats ISO datetime', () => {
    const result = formatDateTime('2025-03-15T14:30:00')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/14:30|2:30/)
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })
  it('formats KB', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
  })
  it('formats MB', () => {
    expect(formatFileSize(1048576)).toBe('1 MB')
  })
  it('formats GB', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })
})

describe('formatPercentage', () => {
  it('formats percentage with decimals', () => {
    expect(formatPercentage(75.6, 1)).toBe('75.6%')
  })
  it('formats integer percentage', () => {
    expect(formatPercentage(0)).toBe('0%')
  })
  it('formats with default 0 decimals', () => {
    expect(formatPercentage(42)).toBe('42%')
  })
})

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('He...')
  })
  it('does not truncate short strings', () => {
    expect(truncate('Hi', 10)).toBe('Hi')
  })
})

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })
  it('handles empty string', () => {
    expect(capitalize('')).toBe('')
  })
})

describe('slugify', () => {
  it('creates slug from string', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })
  it('handles special characters', () => {
    expect(slugify('Atto di Citazione — n. 123')).toBe('atto-di-citazione-n-123')
  })
})
