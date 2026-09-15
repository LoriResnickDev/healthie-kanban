import { describe, expect, it } from 'vitest'
import {
  finishTaskMove,
  moveTaskAcrossColumns,
  moveTaskOnBoard,
  shouldCelebrateDoneMove,
} from './board'
import type { BoardState } from './types'

const board: BoardState = {
  todo: [
    { id: 'task-1', title: 'First task', characterId: '1' },
    { id: 'task-2', title: 'Second task', characterId: '2' },
  ],
  doing: [{ id: 'task-3', title: 'Third task', characterId: '1' }],
  done: [],
}

describe('moveTaskOnBoard', () => {
  it("reorders a task to another task's position in the same column", () => {
    const nextBoard = moveTaskOnBoard(board, 'task-1', 'task-2')

    expect(nextBoard.todo.map((task) => task.id)).toEqual(['task-2', 'task-1'])
    expect(nextBoard.doing).toBe(board.doing)
    expect(nextBoard.done).toBe(board.done)
  })

  it('moves a task to the end of the same column when dropped over that column', () => {
    const nextBoard = moveTaskOnBoard(board, 'task-1', 'todo')

    expect(nextBoard.todo.map((task) => task.id)).toEqual(['task-2', 'task-1'])
    expect(nextBoard.doing).toBe(board.doing)
    expect(nextBoard.done).toBe(board.done)
  })

  it("moves a task to another column at another task's position", () => {
    const nextBoard = moveTaskOnBoard(board, 'task-1', 'task-3')

    expect(nextBoard.todo.map((task) => task.id)).toEqual(['task-2'])
    expect(nextBoard.doing.map((task) => task.id)).toEqual(['task-1', 'task-3'])
    expect(nextBoard.done).toBe(board.done)
  })

  it('appends a task to a different column when dropped over that column', () => {
    const nextBoard = moveTaskOnBoard(board, 'task-1', 'done')

    expect(nextBoard.todo.map((task) => task.id)).toEqual(['task-2'])
    expect(nextBoard.doing).toBe(board.doing)
    expect(nextBoard.done.map((task) => task.id)).toEqual(['task-1'])
  })

  it('does nothing when the active task is unknown', () => {
    const nextBoard = moveTaskOnBoard(board, 'missing-task', 'done')

    expect(nextBoard).toBe(board)
  })

  it('does nothing when the destination is unknown', () => {
    const nextBoard = moveTaskOnBoard(board, 'task-1', 'missing-task')

    expect(nextBoard).toBe(board)
  })
})

describe('moveTaskAcrossColumns', () => {
  it('moves a task to a different column', () => {
    const nextBoard = moveTaskAcrossColumns(board, 'task-1', 'done')

    expect(nextBoard.todo.map((task) => task.id)).toEqual(['task-2'])
    expect(nextBoard.done.map((task) => task.id)).toEqual(['task-1'])
  })

  it('does not reorder within the same column', () => {
    const nextBoard = moveTaskAcrossColumns(board, 'task-1', 'task-2')

    expect(nextBoard).toBe(board)
  })
})

describe('finishTaskMove', () => {
  it('preserves same-column reordering at drag end', () => {
    const nextBoard = finishTaskMove(board, 'task-1', 'task-2', 'todo')

    expect(nextBoard.todo.map((task) => task.id)).toEqual(['task-2', 'task-1'])
  })

  it('does not move a cross-column task a second time when it is already before the target task', () => {
    const dragOverBoard = moveTaskAcrossColumns(board, 'task-1', 'task-3')
    const nextBoard = finishTaskMove(dragOverBoard, 'task-1', 'task-3', 'todo')

    expect(nextBoard).toBe(dragOverBoard)
  })

  it('does not move a cross-column task a second time when it is already at the end of the destination column', () => {
    const dragOverBoard = moveTaskAcrossColumns(board, 'task-1', 'done')
    const nextBoard = finishTaskMove(dragOverBoard, 'task-1', 'done', 'todo')

    expect(nextBoard).toBe(dragOverBoard)
  })
})

describe('shouldCelebrateDoneMove', () => {
  it('celebrates when a task starts in To Do and ends in Done', () => {
    expect(shouldCelebrateDoneMove('todo', 'done')).toBe(true)
  })

  it('celebrates when a task starts in Doing and ends in Done', () => {
    expect(shouldCelebrateDoneMove('doing', 'done')).toBe(true)
  })

  it('does not celebrate when reordering within Done', () => {
    expect(shouldCelebrateDoneMove('done', 'done')).toBe(false)
  })

  it('does not celebrate when a task starts in Done, leaves, and returns to Done', () => {
    expect(shouldCelebrateDoneMove('done', 'done')).toBe(false)
  })

  it('does not celebrate when a task is dropped outside Done', () => {
    expect(shouldCelebrateDoneMove('todo', 'doing')).toBe(false)
  })

  it('does not celebrate when the original column is unknown', () => {
    expect(shouldCelebrateDoneMove(null, 'done')).toBe(false)
  })
})
