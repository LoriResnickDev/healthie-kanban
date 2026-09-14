import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { RICK_AND_MORTY_GRAPHQL_ENDPOINT } from './api/characters'

function createCharactersResponse() {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        data: {
          characters: {
            results: [
              {
                id: '1',
                name: 'Rick Sanchez',
                image: 'https://example.com/rick.png',
              },
            ],
          },
        },
      }),
  }
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows a loading state while characters load', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    )

    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Healthie Kanban' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading characters...',
    )
  })

  it('fetches characters and renders the board shell after loading succeeds', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(createCharactersResponse()))
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(
      await screen.findByRole('region', { name: 'Kanban board' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'To Do' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Doing' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Done' })).toBeInTheDocument()
    expect(screen.getAllByText('No tasks yet.')).toHaveLength(3)
    expect(fetchMock).toHaveBeenCalledWith(
      RICK_AND_MORTY_GRAPHQL_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('GetCharacters'),
      }),
    )
  })

  it('shows an error state and retries loading characters', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce(createCharactersResponse())
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Characters could not be loaded.',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('region', { name: 'Kanban board' }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
