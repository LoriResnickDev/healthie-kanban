import { arrayMove } from '@dnd-kit/sortable'
import type { BoardState, ColumnId } from './types'

const columnIds: ColumnId[] = ['todo', 'doing', 'done']

export function isColumnId(value: string): value is ColumnId {
  return columnIds.includes(value as ColumnId)
}

export function findTaskColumn(
  board: BoardState,
  taskId: string,
): ColumnId | null {
  return (
    columnIds.find((columnId) =>
      board[columnId].some((task) => task.id === taskId),
    ) ?? null
  )
}

export function moveTaskOnBoard(
  board: BoardState,
  activeTaskId: string,
  overId: string,
): BoardState {
  const activeColumnId = findTaskColumn(board, activeTaskId)

  if (!activeColumnId) {
    return board
  }

  const overColumnId = isColumnId(overId)
    ? overId
    : findTaskColumn(board, overId)

  if (!overColumnId) {
    return board
  }

  const activeTasks = board[activeColumnId]
  const activeIndex = activeTasks.findIndex((task) => task.id === activeTaskId)

  if (activeIndex === -1) {
    return board
  }

  if (activeColumnId === overColumnId) {
    const overIndex = isColumnId(overId)
      ? activeTasks.length - 1
      : activeTasks.findIndex((task) => task.id === overId)

    if (overIndex === -1) {
      return board
    }

    return {
      ...board,
      [activeColumnId]: arrayMove(activeTasks, activeIndex, overIndex),
    }
  }

  const activeTask = activeTasks[activeIndex]
  const destinationTasks = board[overColumnId]
  const destinationIndex = isColumnId(overId)
    ? destinationTasks.length
    : destinationTasks.findIndex((task) => task.id === overId)

  if (destinationIndex === -1) {
    return board
  }

  const nextActiveTasks = activeTasks.filter((task) => task.id !== activeTaskId)
  const nextDestinationTasks = [...destinationTasks]
  nextDestinationTasks.splice(destinationIndex, 0, activeTask)

  return {
    ...board,
    [activeColumnId]: nextActiveTasks,
    [overColumnId]: nextDestinationTasks,
  }
}

export function moveTaskAcrossColumns(
  board: BoardState,
  activeTaskId: string,
  overId: string,
): BoardState {
  const activeColumnId = findTaskColumn(board, activeTaskId)
  const overColumnId = isColumnId(overId)
    ? overId
    : findTaskColumn(board, overId)

  if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
    return board
  }

  return moveTaskOnBoard(board, activeTaskId, overId)
}

export function finishTaskMove(
  board: BoardState,
  activeTaskId: string,
  overId: string,
  dragStartColumnId: ColumnId | null,
): BoardState {
  const activeColumnId = findTaskColumn(board, activeTaskId)

  if (!activeColumnId) {
    return board
  }

  if (activeColumnId === dragStartColumnId) {
    return moveTaskOnBoard(board, activeTaskId, overId)
  }

  if (isColumnId(overId)) {
    const activeTasks = board[activeColumnId]
    const activeIndex = activeTasks.findIndex(
      (task) => task.id === activeTaskId,
    )

    return activeIndex === activeTasks.length - 1
      ? board
      : moveTaskOnBoard(board, activeTaskId, overId)
  }

  const overColumnId = findTaskColumn(board, overId)

  if (activeColumnId !== overColumnId) {
    return moveTaskOnBoard(board, activeTaskId, overId)
  }

  const activeTasks = board[activeColumnId]
  const activeIndex = activeTasks.findIndex((task) => task.id === activeTaskId)
  const overIndex = activeTasks.findIndex((task) => task.id === overId)

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex - 1) {
    return board
  }

  return moveTaskOnBoard(board, activeTaskId, overId)
}

export function shouldCelebrateDoneMove(
  startColumnId: ColumnId | null,
  finalColumnId: ColumnId | null,
): boolean {
  return (
    startColumnId !== null &&
    startColumnId !== 'done' &&
    finalColumnId === 'done'
  )
}
