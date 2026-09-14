import { arrayMove } from '@dnd-kit/sortable'
import type { BoardState, ColumnId } from './types'

const columnIds: ColumnId[] = ['todo', 'doing', 'done']

function findTaskColumn(board: BoardState, taskId: string): ColumnId | null {
  return (
    columnIds.find((columnId) =>
      board[columnId].some((task) => task.id === taskId),
    ) ?? null
  )
}

export function reorderTaskWithinColumn(
  board: BoardState,
  activeTaskId: string,
  overTaskId: string,
): BoardState {
  const activeColumnId = findTaskColumn(board, activeTaskId)
  const overColumnId = findTaskColumn(board, overTaskId)

  if (!activeColumnId || activeColumnId !== overColumnId) {
    return board
  }

  const columnTasks = board[activeColumnId]
  const activeIndex = columnTasks.findIndex((task) => task.id === activeTaskId)
  const overIndex = columnTasks.findIndex((task) => task.id === overTaskId)

  if (activeIndex === -1 || overIndex === -1) {
    return board
  }

  return {
    ...board,
    [activeColumnId]: arrayMove(columnTasks, activeIndex, overIndex),
  }
}
