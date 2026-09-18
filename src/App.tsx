import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchCharacters } from './api/characters'
import {
  findTaskColumn,
  finishTaskMove,
  isColumnId,
  moveTaskAcrossColumns,
  shouldCelebrateDoneMove,
} from './board'
import AddTaskDialog from './components/AddTaskDialog'
import BoardColumn from './components/BoardColumn'
import DoneCelebration from './components/DoneCelebration'
import { getColumnDropPlacement } from './dragDrop'
import type { BoardState, Character, ColumnId, Task } from './types'

type CharacterLoadState =
  | { status: 'loading' }
  | { status: 'success'; characters: Character[] }
  | { status: 'error'; message: string }

type CelebrationState = {
  id: string
  character: Character
} | null

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

const emptyCharacters: Character[] = []

function App() {
  const [board, setBoard] = useState<BoardState>(initialBoardState)
  const [characterLoadState, setCharacterLoadState] =
    useState<CharacterLoadState>({ status: 'loading' })
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [celebration, setCelebration] = useState<CelebrationState>(null)
  const addTaskButtonRef = useRef<HTMLButtonElement>(null)
  const dragStartColumnRef = useRef<ColumnId | null>(null)
  const dragStartBoardRef = useRef<BoardState | null>(null)
  // Pointer and keyboard sensors share the same board logic so drag behavior stays consistent across input methods.
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function loadCharacters() {
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
  }

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

  useEffect(() => {
    if (!celebration) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCelebration(null)
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [celebration])

  function handleAddTask({ title, characterId }: Omit<Task, 'id'>) {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      characterId,
    }

    setBoard((currentBoard) => ({
      ...currentBoard,
      todo: [...currentBoard.todo, task],
    }))
  }

  const handleCloseAddTaskDialog = useCallback(() => {
    setIsAddTaskDialogOpen(false)
    addTaskButtonRef.current?.focus()
  }, [])

  const characters =
    characterLoadState.status === 'success'
      ? characterLoadState.characters
      : emptyCharacters
  const charactersById = useMemo(
    () => new Map(characters.map((character) => [character.id, character])),
    [characters],
  )

  function handleDragStart({ active }: DragStartEvent) {
    dragStartColumnRef.current = findTaskColumn(board, String(active.id))
    dragStartBoardRef.current = board
  }

  // Cross-column movement happens during drag-over so the dragged card remains visually in the column it has entered.
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    setBoard((currentBoard) => {
      const overId = String(over.id)
      const columnDropPlacement = isColumnId(overId)
        ? getColumnDropPlacement(event, currentBoard, overId)
        : undefined

      return moveTaskAcrossColumns(
        currentBoard,
        String(active.id),
        overId,
        columnDropPlacement,
      )
    })
  }

  // Drag end finalizes ordering without repeating cross-column moves already
  // applied during drag-over, then checks whether the drop should celebrate Done.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const activeTaskId = String(active.id)
    const startColumnId = dragStartColumnRef.current

    if (!over) {
      dragStartColumnRef.current = null
      dragStartBoardRef.current = null
      return
    }

    const overId = String(over.id)
    const columnDropPlacement = isColumnId(overId)
      ? getColumnDropPlacement(event, board, overId)
      : undefined
    const nextBoard =
      active.id === over.id
        ? board
        : finishTaskMove(
            board,
            activeTaskId,
            overId,
            startColumnId,
            columnDropPlacement,
          )
    const finalColumnId = findTaskColumn(nextBoard, activeTaskId)

    if (nextBoard !== board) {
      setBoard(nextBoard)
    }

    if (shouldCelebrateDoneMove(startColumnId, finalColumnId)) {
      const completedTask = nextBoard.done.find(
        (task) => task.id === activeTaskId,
      )
      const character = completedTask
        ? charactersById.get(completedTask.characterId)
        : undefined

      if (character) {
        setCelebration({ id: crypto.randomUUID(), character })
      }
    }

    dragStartColumnRef.current = null
    dragStartBoardRef.current = null
  }

  function handleDragCancel() {
    if (dragStartBoardRef.current) {
      setBoard(dragStartBoardRef.current)
    }

    dragStartColumnRef.current = null
    dragStartBoardRef.current = null
  }

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
        <DndContext
          autoScroll={false}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
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
        </DndContext>
      ) : null}
      {isAddTaskDialogOpen ? (
        <AddTaskDialog
          characters={characters}
          onAddTask={handleAddTask}
          onClose={handleCloseAddTaskDialog}
        />
      ) : null}
      {celebration ? (
        <DoneCelebration
          key={celebration.id}
          character={celebration.character}
        />
      ) : null}
    </main>
  )
}

export default App
