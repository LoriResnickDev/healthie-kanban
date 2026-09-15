import { useEffect, useRef, useState } from 'react'
import type { Character } from '../types'

type AddTaskInput = {
  title: string
  characterId: string
}

type AddTaskDialogProps = {
  characters: Character[]
  onAddTask: (task: AddTaskInput) => void
  onClose: () => void
}

type FormErrors = {
  title?: string
  characterId?: string
}

function AddTaskDialog({ characters, onAddTask, onClose }: AddTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [characterId, setCharacterId] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return undefined
    }

    // Rely on the native dialog for modal focus containment and Escape handling
    // rather than implementing a custom focus trap.
    dialog.showModal()
    titleInputRef.current?.focus()

    dialog.addEventListener('close', onClose)

    return () => {
      dialog.removeEventListener('close', onClose)
    }
  }, [onClose])

  function submitTask() {
    const trimmedTitle = title.trim()
    const nextErrors: FormErrors = {}

    if (trimmedTitle.length === 0) {
      nextErrors.title = 'Enter a task title.'
    } else if (trimmedTitle.length > 100) {
      nextErrors.title = 'Task title must be 100 characters or fewer.'
    }

    if (characterId.length === 0) {
      nextErrors.characterId = 'Choose a character.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    onAddTask({ title: trimmedTitle, characterId })
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="add-task-dialog"
      aria-labelledby="add-task-dialog-title"
    >
      <form
        className="add-task-form"
        onSubmit={(event) => {
          event.preventDefault()
          submitTask()
        }}
      >
        <div className="dialog-header">
          <h2 id="add-task-dialog-title">Add Task</h2>
          <button
            className="icon-button"
            type="button"
            aria-label="Close dialog"
            onClick={() => dialogRef.current?.close()}
          >
            &times;
          </button>
        </div>

        <div className="form-field">
          <label htmlFor="task-title">Task title</label>
          <input
            ref={titleInputRef}
            id="task-title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={errors.title ? 'true' : undefined}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
          />
          {errors.title ? (
            <p className="field-error" id="task-title-error">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="task-character">Character</label>
          <select
            id="task-character"
            name="character"
            value={characterId}
            onChange={(event) => setCharacterId(event.target.value)}
            aria-invalid={errors.characterId ? 'true' : undefined}
            aria-describedby={
              errors.characterId ? 'task-character-error' : undefined
            }
          >
            <option value="">Choose a character</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
          {errors.characterId ? (
            <p className="field-error" id="task-character-error">
              {errors.characterId}
            </p>
          ) : null}
        </div>

        <div className="dialog-actions">
          <button type="button" onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="submit">Add Task</button>
        </div>
      </form>
    </dialog>
  )
}

export default AddTaskDialog
