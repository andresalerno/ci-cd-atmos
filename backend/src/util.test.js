// Teste simples com Vitest + JUnit reporter (config em vitest.config.js)
import { describe, it, expect } from 'vitest'
import { sum } from './util.js'

describe('util', () => {
  it('sum adds numbers', () => {
    expect(sum(2, 3)).toBe(5)
  })
})

