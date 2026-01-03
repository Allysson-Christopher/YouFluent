import { describe, it, expect } from 'vitest'
import { cn } from '@/shared/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    // tailwind-merge replaces conflicting classes (px-2 -> px-4)
    expect(result).toContain('px-4')
    expect(result).toContain('py-1')
    expect(result).not.toContain('px-2')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('should filter out falsy values', () => {
    const result = cn('base', false, null, undefined, 'end')
    expect(result).toBe('base end')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should merge tailwind conflicting classes', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })
})
