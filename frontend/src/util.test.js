// Teste simples com Vitest para gerar JUnit e cobertura
import { describe, it, expect } from 'vitest'

function inc(x) { return x + 1 }

describe('util', () => {
  it('inc increments number', () => {
    expect(inc(1)).toBe(2)
  })
})

