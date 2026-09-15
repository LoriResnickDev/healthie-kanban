// Store the character reference rather than duplicating API-owned character
// data in each task.
export type Task = {
  id: string
  title: string
  characterId: string
}

export type Character = {
  id: string
  name: string
  image: string
}

export type ColumnId = 'todo' | 'doing' | 'done'

// Task order within each column array is the source of truth for board
// rendering and reordering.
export type BoardState = {
  todo: Task[]
  doing: Task[]
  done: Task[]
}
