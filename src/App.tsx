import { useState } from 'react'
import BoardColumn from './components/BoardColumn'
import type { BoardState, ColumnId } from './types'

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

function App() {
  const [board] = useState<BoardState>(initialBoardState)

  return (
    <main>
      <h1>Healthie Kanban</h1>
      <section className="board" aria-label="Kanban board">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={board[column.id]}
          />
        ))}
      </section>
    </main>
  )
}

export default App
