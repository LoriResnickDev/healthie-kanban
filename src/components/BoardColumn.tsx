import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
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
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <section
      ref={setNodeRef}
      className={
        isOver ? 'board-column board-column-drop-target' : 'board-column'
      }
      aria-labelledby={headingId}
    >
      <h2 id={headingId}>{title}</h2>
      <div className="task-list" aria-label={`${title} tasks`}>
        {tasks.length === 0 ? (
          <p className="empty-column">No tasks yet.</p>
        ) : (
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                character={charactersById.get(task.characterId)}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </section>
  )
}

export default BoardColumn
