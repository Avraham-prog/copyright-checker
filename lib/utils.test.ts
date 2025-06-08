import { cn } from './utils'

describe('cn', () => {
  it('merges Tailwind class names', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })
})
