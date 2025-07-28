// src/lib/utils/__tests__/utils.test.ts
import { formatCurrency, formatPercentage, calculateROI } from '../utils'

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('formatPercentage', () => {
  it('formats positive percentages', () => {
    expect(formatPercentage(0.1234)).toBe('12.34%')
  })

  it('formats negative percentages', () => {
    expect(formatPercentage(-0.1234)).toBe('-12.34%')
  })
})

describe('calculateROI', () => {
  it('calculates positive ROI', () => {
    expect(calculateROI(100, 150)).toBe(0.5)
  })

  it('calculates negative ROI', () => {
    expect(calculateROI(100, 50)).toBe(-0.5)
  })

  it('handles zero initial value', () => {
    expect(calculateROI(0, 100)).toBe(0)
  })
})