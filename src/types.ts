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

export type BoardState = {
  todo: Task[]
  doing: Task[]
  done: Task[]
}
