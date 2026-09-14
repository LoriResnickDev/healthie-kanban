import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
              {
                id: '2',
                name: 'Morty Smith',
                image: 'https://example.com/morty.png',
              },
            ],
          },
        },
      }),
  }
}

describe('App', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal(
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '')
    })
    HTMLDialogElement.prototype.close = vi.fn(function close(
      this: HTMLDialogElement,
    ) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    })
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-4000-8000-000000000001',
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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

  it('opens and cancels the add task dialog', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(createCharactersResponse())),
    )

    render(<App />)

    const addTaskButton = await screen.findByRole('button', {
      name: 'Add Task',
    })

    fireEvent.click(addTaskButton)

    expect(screen.getByRole('dialog', { name: 'Add Task' })).toBeInTheDocument()
    expect(screen.getByLabelText('Task title')).toHaveFocus()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(
      screen.queryByRole('dialog', { name: 'Add Task' }),
    ).not.toBeInTheDocument()
    expect(addTaskButton).toHaveFocus()
  })

  it('shows validation errors when required task fields are missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(createCharactersResponse())),
    )

    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: 'Add Task' }))
    const dialog = screen.getByRole('dialog', { name: 'Add Task' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Task' }))

    const titleInput = screen.getByLabelText('Task title')
    const characterSelect = screen.getByLabelText('Character')

    expect(await screen.findByText('Enter a task title.')).toBeInTheDocument()
    expect(screen.getByText('Choose a character.')).toBeInTheDocument()
    expect(titleInput).toHaveAttribute('aria-invalid', 'true')
    expect(titleInput).toHaveAccessibleDescription('Enter a task title.')
    expect(characterSelect).toHaveAttribute('aria-invalid', 'true')
    expect(characterSelect).toHaveAccessibleDescription('Choose a character.')
  })

  it('validates the trimmed task title length', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(createCharactersResponse())),
    )

    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: 'Add Task' }))
    fireEvent.change(screen.getByLabelText('Task title'), {
      target: { value: 'a'.repeat(101) },
    })
    fireEvent.change(screen.getByLabelText('Character'), {
      target: { value: '1' },
    })
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Add Task' })).getByRole(
        'button',
        { name: 'Add Task' },
      ),
    )

    expect(
      await screen.findByText('Task title must be 100 characters or fewer.'),
    ).toBeInTheDocument()
  })

  it('creates a task in To Do with its assigned character', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(createCharactersResponse())),
    )

    render(<App />)

    const addTaskButton = await screen.findByRole('button', {
      name: 'Add Task',
    })

    fireEvent.click(addTaskButton)
    fireEvent.change(screen.getByLabelText('Task title'), {
      target: { value: '  Portal paperwork  ' },
    })
    fireEvent.change(screen.getByLabelText('Character'), {
      target: { value: '2' },
    })
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Add Task' })).getByRole(
        'button',
        { name: 'Add Task' },
      ),
    )

    const todoColumn = screen.getByRole('region', { name: 'To Do' })
    const doingColumn = screen.getByRole('region', { name: 'Doing' })
    const doneColumn = screen.getByRole('region', { name: 'Done' })

    expect(todoColumn).toHaveTextContent('Portal paperwork')
    expect(todoColumn).toHaveTextContent('Morty Smith')
    expect(todoColumn.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/morty.png',
    )
    expect(doingColumn).toHaveTextContent('No tasks yet.')
    expect(doneColumn).toHaveTextContent('No tasks yet.')
    expect(crypto.randomUUID).toHaveBeenCalled()
  })
})
