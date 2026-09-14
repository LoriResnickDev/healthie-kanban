import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchCharacters } from './api/characters'
import AddTaskDialog from './components/AddTaskDialog'
import BoardColumn from './components/BoardColumn'
import type { BoardState, Character, ColumnId, Task } from './types'

type CharacterLoadState =
  | { status: 'loading' }
  | { status: 'success'; characters: Character[] }
  | { status: 'error'; message: string }

const columns: Array<{ id: ColumnId; title: string }> = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
]

const initialBoardState: BoardState = {
  todo: [],
  doing: [],
  done: [],
}

function App() {
  const [board, setBoard] = useState<BoardState>(initialBoardState)
  const [characterLoadState, setCharacterLoadState] =
    useState<CharacterLoadState>({ status: 'loading' })
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const addTaskButtonRef = useRef<HTMLButtonElement>(null)

  const loadCharacters = useCallback(() => {
    setCharacterLoadState({ status: 'loading' })

    return fetchCharacters()
      .then((characters) => {
        setCharacterLoadState({ status: 'success', characters })
      })
      .catch(() => {
        setCharacterLoadState({
          status: 'error',
          message: 'Characters could not be loaded.',
        })
      })
  }, [])

  useEffect(() => {
    let ignoreResult = false

    fetchCharacters()
      .then((characters) => {
        if (!ignoreResult) {
          setCharacterLoadState({ status: 'success', characters })
        }
      })
      .catch(() => {
        if (!ignoreResult) {
          setCharacterLoadState({
            status: 'error',
            message: 'Characters could not be loaded.',
          })
        }
      })

    return () => {
      ignoreResult = true
    }
  }, [])

  const handleAddTask = useCallback(
    ({ title, characterId }: Omit<Task, 'id'>) => {
      const task: Task = {
        id: crypto.randomUUID(),
        title,
        characterId,
      }

      setBoard((currentBoard) => ({
        ...currentBoard,
        todo: [...currentBoard.todo, task],
      }))
    },
    [],
  )

  const handleCloseAddTaskDialog = useCallback(() => {
    setIsAddTaskDialogOpen(false)
    addTaskButtonRef.current?.focus()
  }, [])

  const characters =
    characterLoadState.status === 'success' ? characterLoadState.characters : []
  const charactersById = new Map(
    characters.map((character) => [character.id, character]),
  )

  return (
    <main>
      <div className="app-header">
        <h1>Healthie Kanban</h1>
        {characterLoadState.status === 'success' ? (
          <button
            ref={addTaskButtonRef}
            type="button"
            onClick={() => setIsAddTaskDialogOpen(true)}
          >
            Add Task
          </button>
        ) : null}
      </div>
      {characterLoadState.status === 'loading' ? (
        <p className="status-message" role="status">
          Loading characters...
        </p>
      ) : null}
      {characterLoadState.status === 'error' ? (
        <div className="status-message status-message-error" role="alert">
          <p>{characterLoadState.message}</p>
          <button type="button" onClick={loadCharacters}>
            Retry
          </button>
        </div>
      ) : null}
      {characterLoadState.status === 'success' ? (
        <section className="board" aria-label="Kanban board">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={board[column.id]}
              charactersById={charactersById}
            />
          ))}
        </section>
      ) : null}
      {isAddTaskDialogOpen ? (
        <AddTaskDialog
          characters={characters}
          onAddTask={handleAddTask}
          onClose={handleCloseAddTaskDialog}
        />
      ) : null}
    </main>
  )
}

export default App
