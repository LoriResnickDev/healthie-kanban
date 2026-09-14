import type { ColumnId, Task } from '../types'

type BoardColumnProps = {
  id: ColumnId
  title: string
  tasks: Task[]
}

function BoardColumn({ id, title, tasks }: BoardColumnProps) {
  const headingId = `${id}-column-heading`

  return (
    <section className="board-column" aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <div className="task-list" aria-label={`${title} tasks`}>
        {tasks.length === 0 ? (
          <p className="empty-column">No tasks yet.</p>
        ) : null}
      </div>
    </section>
  )
}

export default BoardColumn
