import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Character, Task } from '../types'

type TaskCardProps = {
  task: Task
  character: Character | undefined
}

function TaskCard({ task, character }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article
      ref={setNodeRef}
      className={isDragging ? 'task-card task-card-dragging' : 'task-card'}
      style={style}
      {...attributes}
      {...listeners}
    >
      <h3>{task.title}</h3>
      <div className="task-character">
        {character ? (
          <img src={character.image} alt="" className="task-avatar" />
        ) : null}
        <span>{character?.name ?? 'Unknown character'}</span>
      </div>
    </article>
  )
}

export default TaskCard
