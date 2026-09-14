import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the board shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Healthie Kanban' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Kanban board' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'To Do' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Doing' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Done' })).toBeInTheDocument()
    expect(screen.getAllByText('No tasks yet.')).toHaveLength(3)
  })
})
