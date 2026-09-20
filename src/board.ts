import { arrayMove } from '@dnd-kit/sortable'
import type { BoardState, ColumnId } from './types'

const columnIds: ColumnId[] = ['todo', 'doing', 'done']

export type ColumnDropPlacement = 'start' | 'end'
export type TaskDropPlacement = 'before' | 'after'

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

// Board helpers handle task-movement semantics; App translates dnd-kit events
// and geometry into those operations.

// Core board operation for moving/reordering a task.
// Handles both same-column reordering and cross-column insertion.
export function moveTaskOnBoard(
  board: BoardState,
  activeTaskId: string,
  overId: string,
  columnDropPlacement?: ColumnDropPlacement,
  taskDropPlacement?: TaskDropPlacement,
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
      ? getColumnDropIndex(activeTasks.length, columnDropPlacement, true)
      : getTaskDropIndex(activeTasks, activeTaskId, overId, taskDropPlacement)

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
    ? getColumnDropIndex(destinationTasks.length, columnDropPlacement)
    : getTaskDropIndex(
        destinationTasks,
        activeTaskId,
        overId,
        taskDropPlacement,
      )

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

// Used during drag-over to move a task only when it crosses into another column.
// Same-column ordering is left unchanged until drag end.
export function moveTaskAcrossColumns(
  board: BoardState,
  activeTaskId: string,
  overId: string,
  columnDropPlacement?: ColumnDropPlacement,
  taskDropPlacement?: TaskDropPlacement,
): BoardState {
  const activeColumnId = findTaskColumn(board, activeTaskId)
  const overColumnId = isColumnId(overId)
    ? overId
    : findTaskColumn(board, overId)

  if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
    return board
  }

  return moveTaskOnBoard(
    board,
    activeTaskId,
    overId,
    columnDropPlacement,
    taskDropPlacement,
  )
}

// Finalizes task position at drag end. Same-column reordering is applied here;
// cross-column movement normally happens during drag-over, but is handled here if still needed.
export function finishTaskMove(
  board: BoardState,
  activeTaskId: string,
  overId: string,
  dragStartColumnId: ColumnId | null,
  columnDropPlacement?: ColumnDropPlacement,
  taskDropPlacement?: TaskDropPlacement,
): BoardState {
  const activeColumnId = findTaskColumn(board, activeTaskId)

  if (!activeColumnId) {
    return board
  }

  if (activeColumnId === dragStartColumnId) {
    return moveTaskOnBoard(board, activeTaskId, overId, columnDropPlacement)
  }

  if (isColumnId(overId)) {
    if (!columnDropPlacement && activeColumnId !== dragStartColumnId) {
      return board
    }

    const activeTasks = board[activeColumnId]
    const activeIndex = activeTasks.findIndex(
      (task) => task.id === activeTaskId,
    )

    const destinationIndex = getColumnDropIndex(
      activeTasks.length,
      columnDropPlacement,
      true,
    )

    return activeIndex === destinationIndex
      ? board
      : moveTaskOnBoard(board, activeTaskId, overId, columnDropPlacement)
  }

  const overColumnId = findTaskColumn(board, overId)

  if (activeColumnId !== overColumnId) {
    return moveTaskOnBoard(
      board,
      activeTaskId,
      overId,
      columnDropPlacement,
      taskDropPlacement,
    )
  }

  const activeTasks = board[activeColumnId]
  const activeIndex = activeTasks.findIndex((task) => task.id === activeTaskId)
  const destinationIndex = getTaskDropIndex(
    activeTasks,
    activeTaskId,
    overId,
    taskDropPlacement,
  )

  if (activeIndex === -1 || destinationIndex === -1) {
    return board
  }

  if (
    activeIndex === destinationIndex ||
    (!taskDropPlacement && activeIndex === destinationIndex - 1)
  ) {
    return board
  }

  return moveTaskOnBoard(
    board,
    activeTaskId,
    overId,
    columnDropPlacement,
    taskDropPlacement,
  )
}

// Celebrate only when a task finishes in Done after starting in another column.
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

// Converts a column-level drop into the array index where the task should land.
function getColumnDropIndex(
  taskCount: number,
  columnDropPlacement?: ColumnDropPlacement,
  isSameColumn = false,
): number {
  if (columnDropPlacement === 'start') {
    return 0
  }

  return isSameColumn ? taskCount - 1 : taskCount
}

// Converts before/after task placement into an array index, accounting for
// the active task's removal when reordering within the same column.
function getTaskDropIndex(
  tasks: BoardState[ColumnId],
  activeTaskId: string,
  overTaskId: string,
  taskDropPlacement?: TaskDropPlacement,
): number {
  const activeIndex = tasks.findIndex((task) => task.id === activeTaskId)
  const overIndex = tasks.findIndex((task) => task.id === overTaskId)

  if (overIndex === -1) {
    return -1
  }

  if (taskDropPlacement === 'before') {
    return activeIndex !== -1 && activeIndex < overIndex
      ? overIndex - 1
      : overIndex
  }

  if (taskDropPlacement === 'after') {
    return activeIndex !== -1 && activeIndex < overIndex
      ? overIndex
      : overIndex + 1
  }

  return overIndex
}
