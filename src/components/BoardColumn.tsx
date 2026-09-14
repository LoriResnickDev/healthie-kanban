import TaskCard from './TaskCard'
import type { Character, ColumnId, Task } from '../types'

type BoardColumnProps = {
  id: ColumnId
  title: string
  tasks: Task[]
  charactersById: Map<string, Character>
}

function BoardColumn({ id, title, tasks, charactersById }: BoardColumnProps) {
  const headingId = `${id}-column-heading`

  return (
    <section className="board-column" aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <div className="task-list" aria-label={`${title} tasks`}>
        {tasks.length === 0 ? (
          <p className="empty-column">No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              character={charactersById.get(task.characterId)}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default BoardColumn
