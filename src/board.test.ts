import { describe, expect, it } from 'vitest'
import { reorderTaskWithinColumn } from './board'
import type { BoardState } from './types'

const board: BoardState = {
  todo: [
    { id: 'task-1', title: 'First task', characterId: '1' },
    { id: 'task-2', title: 'Second task', characterId: '2' },
  ],
  doing: [{ id: 'task-3', title: 'Third task', characterId: '1' }],
  done: [],
}

describe('reorderTaskWithinColumn', () => {
  it('reorders tasks in the same column', () => {
    const nextBoard = reorderTaskWithinColumn(board, 'task-1', 'task-2')

    expect(nextBoard.todo.map((task) => task.id)).toEqual(['task-2', 'task-1'])
    expect(nextBoard.doing).toBe(board.doing)
    expect(nextBoard.done).toBe(board.done)
  })

  it('does not move tasks between columns', () => {
    const nextBoard = reorderTaskWithinColumn(board, 'task-1', 'task-3')

    expect(nextBoard).toBe(board)
  })
})
