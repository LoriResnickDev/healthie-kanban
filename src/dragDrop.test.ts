import type { ClientRect } from '@dnd-kit/core'
import { describe, expect, it } from 'vitest'
import { getColumnDropPlacement, getTaskDropPlacement } from './dragDrop'
import type { BoardState } from './types'

type ColumnPlacementEvent = Parameters<typeof getColumnDropPlacement>[0]

const board: BoardState = {
  todo: [
    { id: 'task-1', title: 'First task', characterId: '1' },
    { id: 'task-2', title: 'Second task', characterId: '2' },
    { id: 'task-3', title: 'Third task', characterId: '3' },
  ],
  doing: [],
  done: [],
}

function createRect(top: number, height = 20): ClientRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: 100,
    width: 100,
    height,
  }
}

function createEvent({
  activeId,
  activeRect,
  collisionRects,
}: {
  activeId: string
  activeRect: ClientRect | null
  collisionRects: Record<string, ClientRect>
}): ColumnPlacementEvent {
  return {
    active: {
      id: activeId,
      rect: {
        current: {
          initial: null,
          translated: activeRect,
        },
      },
    },
    collisions: Object.entries(collisionRects).map(([id, rect]) => ({
      id,
      data: {
        droppableContainer: {
          rect: {
            current: rect,
          },
        },
      },
    })),
  } as unknown as ColumnPlacementEvent
}

describe('getColumnDropPlacement', () => {
  it('excludes the active task from destination boundary comparisons', () => {
    const twoTaskBoard: BoardState = {
      ...board,
      todo: [board.todo[0], board.todo[1]],
    }
    const event = createEvent({
      activeId: 'task-2',
      activeRect: createRect(40),
      collisionRects: {
        'task-1': createRect(100),
      },
    })

    expect(getColumnDropPlacement(event, twoTaskBoard, 'todo')).toBe('start')
  })

  it('returns start when the active center is clearly above the first remaining task', () => {
    const event = createEvent({
      activeId: 'task-3',
      activeRect: createRect(40),
      collisionRects: {
        'task-1': createRect(100),
        'task-2': createRect(150),
      },
    })

    expect(getColumnDropPlacement(event, board, 'todo')).toBe('start')
  })

  it('returns end when the active center is clearly below the last remaining task', () => {
    const event = createEvent({
      activeId: 'task-1',
      activeRect: createRect(200),
      collisionRects: {
        'task-2': createRect(100),
        'task-3': createRect(150),
      },
    })

    expect(getColumnDropPlacement(event, board, 'todo')).toBe('end')
  })

  it('returns undefined when the active center is between destination task boundaries', () => {
    const event = createEvent({
      activeId: 'task-1',
      activeRect: createRect(125),
      collisionRects: {
        'task-2': createRect(100),
        'task-3': createRect(150),
      },
    })

    expect(getColumnDropPlacement(event, board, 'todo')).toBeUndefined()
  })

  it('returns undefined when required geometry is missing', () => {
    const event = createEvent({
      activeId: 'task-3',
      activeRect: null,
      collisionRects: {
        'task-1': createRect(100),
        'task-2': createRect(150),
      },
    })

    expect(getColumnDropPlacement(event, board, 'todo')).toBeUndefined()
  })
})

describe('getTaskDropPlacement', () => {
  it('returns before when the active center is above the target task center', () => {
    const event = createEvent({
      activeId: 'task-2',
      activeRect: createRect(40),
      collisionRects: {
        'task-1': createRect(100),
      },
    })

    expect(getTaskDropPlacement(event, 'task-1')).toBe('before')
  })

  it('returns after when the active center is below the target task center', () => {
    const event = createEvent({
      activeId: 'task-2',
      activeRect: createRect(160),
      collisionRects: {
        'task-1': createRect(100),
      },
    })

    expect(getTaskDropPlacement(event, 'task-1')).toBe('after')
  })

  it('returns undefined when required geometry is missing', () => {
    const event = createEvent({
      activeId: 'task-2',
      activeRect: null,
      collisionRects: {
        'task-1': createRect(100),
      },
    })

    expect(getTaskDropPlacement(event, 'task-1')).toBeUndefined()
  })
})
