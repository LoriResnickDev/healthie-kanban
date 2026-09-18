import type { ClientRect, DragOverEvent } from '@dnd-kit/core'
import type { ColumnDropPlacement, TaskDropPlacement } from './board'
import type { BoardState, ColumnId } from './types'

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

// When a whole column wins collision detection, use dnd-kit's measured rects to decide only clear before-first/after-last drops.
export function getColumnDropPlacement(
  event: ColumnPlacementEvent,
  board: BoardState,
  columnId: ColumnId,
): ColumnDropPlacement | undefined {
  const activeTaskId = String(event.active.id)
  // Compare against the other tasks in the column; the active task may already be present after drag-over movement.
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

  // Middle-zone or missing geometry is ambiguous, so leave placement unspecified and preserve the existing column-drop behavior.
  return undefined
}

export function getTaskDropPlacement(
  event: ColumnPlacementEvent,
  overTaskId: string,
): TaskDropPlacement | undefined {
  const activeRect = event.active.rect.current.translated
  const overTaskRect = getCollisionRect(event, overTaskId)

  if (!activeRect || !overTaskRect) {
    return undefined
  }

  const activeCenterY = getCenterY(activeRect)
  const overTaskCenterY = getCenterY(overTaskRect)

  if (activeCenterY < overTaskCenterY) {
    return 'before'
  }

  if (activeCenterY > overTaskCenterY) {
    return 'after'
  }

  return undefined
}
