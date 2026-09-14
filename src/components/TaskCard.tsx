import type { Character, Task } from '../types'

type TaskCardProps = {
  task: Task
  character: Character | undefined
}

function TaskCard({ task, character }: TaskCardProps) {
  return (
    <article className="task-card">
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
