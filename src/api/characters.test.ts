import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchCharacters } from './characters'

describe('fetchCharacters', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ignores null character results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                characters: {
                  results: [
                    null,
                    {
                      id: '1',
                      name: 'Rick Sanchez',
                      image: 'https://example.com/rick.png',
                    },
                  ],
                },
              },
            }),
        }),
      ),
    )

    await expect(fetchCharacters()).resolves.toEqual([
      {
        id: '1',
        name: 'Rick Sanchez',
        image: 'https://example.com/rick.png',
      },
    ])
  })

  it('rejects malformed non-null character results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                characters: {
                  results: [
                    {
                      id: '1',
                      name: 'Rick Sanchez',
                    },
                  ],
                },
              },
            }),
        }),
      ),
    )

    await expect(fetchCharacters()).rejects.toThrow(
      'Invalid character data received.',
    )
  })
})
