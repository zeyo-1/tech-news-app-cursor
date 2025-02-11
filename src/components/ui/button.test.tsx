import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>テストボタン</Button>)
    expect(screen.getByText('テストボタン')).toBeInTheDocument()
  })

  it('applies variant class', () => {
    render(<Button variant="destructive">削除</Button>)
    const button = screen.getByText('削除')
    expect(button).toHaveClass('bg-destructive')
  })

  it('applies size class', () => {
    render(<Button size="lg">大きいボタン</Button>)
    const button = screen.getByText('大きいボタン')
    expect(button).toHaveClass('h-11')
  })
}) 