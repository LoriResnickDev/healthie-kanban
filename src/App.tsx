import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type ClientRect,
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
  type ColumnDropPlacement,
} from './board'
import AddTaskDialog from './components/AddTaskDialog'
import BoardColumn from './components/BoardColumn'
import DoneCelebration from './components/DoneCelebration'
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

type ColumnPlacementEvent = Pick<DragOverEvent, 'active' | 'collisions'>

function getCenterY(rect: ClientRect): number {
  return rect.top + rect.height / 2
}

function getCollisionRect(
  { collisions }: ColumnPlacementEvent,
  id: string,
): ClientRect | null {
  const collision = collisions?.find((candidate) => candidate.id === id)

  return collision?.data?.droppableContainer?.rect.current ?? null
}

function getColumnDropPlacement(
  event: ColumnPlacementEvent,
  board: BoardState,
  columnId: ColumnId,
): ColumnDropPlacement | undefined {
  const activeTaskId = String(event.active.id)
  const destinationTasks = board[columnId].filter(
    (task) => task.id !== activeTaskId,
  )
  const firstTask = destinationTasks.at(0)
  const lastTask = destinationTasks.at(-1)
  const activeRect = event.active.rect.current.translated

  if (!activeRect || !firstTask || !lastTask) {
    return undefined
  }

  const firstTaskRect = getCollisionRect(event, firstTask.id)
  const lastTaskRect = getCollisionRect(event, lastTask.id)

  if (!firstTaskRect || !lastTaskRect) {
    return undefined
  }

  const activeCenterY = getCenterY(activeRect)

  if (activeCenterY < getCenterY(firstTaskRect)) {
    return 'start'
  }

  if (activeCenterY > getCenterY(lastTaskRect)) {
    return 'end'
  }

  return undefined
}

function App() {
  const [board, setBoard] = useState<BoardState>(initialBoardState)
  const [characterLoadState, setCharacterLoadState] =
    useState<CharacterLoadState>({ status: 'loading' })
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [celebration, setCelebration] = useState<CelebrationState>(null)
  const addTaskButtonRef = useRef<HTMLButtonElement>(null)
  const dragStartColumnRef = useRef<ColumnId | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

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
    characterLoadState.status === 'success'
      ? characterLoadState.characters
      : emptyCharacters
  const charactersById = useMemo(
    () => new Map(characters.map((character) => [character.id, character])),
    [characters],
  )

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      dragStartColumnRef.current = findTaskColumn(board, String(active.id))
    },
    [board],
  )

  const handleDragOver = useCallback((event: DragOverEvent) => {
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
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      const activeTaskId = String(active.id)
      const startColumnId = dragStartColumnRef.current

      if (!over) {
        dragStartColumnRef.current = null
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
    },
    [board, charactersById],
  )

  const handleDragCancel = useCallback(() => {
    dragStartColumnRef.current = null
  }, [])

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
