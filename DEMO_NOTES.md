# Demo and Manual Verification Notes

These notes provide a checklist for manually verifying and demonstrating interactive
and accessibility behaviors that are easier to exercise in the browser than through
automated tests.

## Add Task Dialog — Pointer

- Click **Add Task** and verify the dialog opens.
- Enter a title and select a character.
- Click **Add Task** and verify the task appears at the end of To Do with the assigned character.
- Open the dialog again and click **Cancel**; verify no task is created.
- Open it again and click the **X**; verify no task is created.

## Add Task Dialog — Keyboard Accessibility

- Use Tab to focus **Add Task**.
- Press Enter or Space to open the dialog.
- Verify initial focus moves to the task title field.
- Use Tab and Shift+Tab to navigate through the dialog controls.
- Verify keyboard focus does not move to interactive content behind the modal dialog.
- Press Escape to close the dialog.
- Verify focus returns to the **Add Task** button.

## Task Validation

- Try to add a task without a title and verify the task is not created.
- Try to add a task without selecting a character and verify the task is not
  created.

## Drag and Drop — Pointer

Using the mouse or trackpad:

- Reorder tasks within the same column.
- Move a task to a non-empty column and verify its placement.
- Move a task to an empty column.
- Move a task between columns and then back again.
- Verify the board remains stable while dragging near column boundaries.

## Drag and Drop — Keyboard Accessibility

- Use Tab to focus a task card.
- Press Space or Enter to pick up the task.
- Use the arrow keys to reorder it within the same column.
- Move it to a non-empty column.
- Move a task to an empty column.
- Press Space or Enter to drop the task.
- During another drag, move the task and then press Escape.
- Verify the task returns to its original position.

## Done Celebration

Verify the completion behavior through both input methods.

### Pointer

- Drag a task from To Do or Doing into Done.
- Verify the Done celebration appears with the assigned character.

### Keyboard

- Pick up a task with Space or Enter.
- Move it from To Do or Doing into Done with the keyboard.
- Drop it with Space or Enter.
- Verify the Done celebration appears with the assigned character.

### Celebration Edge Cases

- Reorder a task that is already in Done and verify it does not trigger another
  celebration.
- Start moving a task into Done and cancel the drag with Escape.
- Verify the task returns to its original position and no celebration occurs.

## Character API Error and Retry

To manually verify the character-loading error state:

1. In `src/api/characters.ts`, temporarily change the Rick and Morty GraphQL
   endpoint to an invalid URL.
2. Reload the app.
3. Verify that the character-loading error state appears with a Retry button.
4. Restore the correct GraphQL endpoint in `src/api/characters.ts`.
5. Click Retry.
6. Verify that the error clears and the application loads normally.

## Reduced Motion

Chrome DevTools can emulate the user's reduced-motion preference:

1. Open Chrome DevTools.
2. Press Cmd+Shift+P to open the Command Menu.
3. Search for and select **Show Rendering**.
4. Find **Emulate CSS media feature prefers-reduced-motion**.
5. Select **prefers-reduced-motion: reduce**.
6. Move a task into Done.
7. Verify the celebration remains visible but its motion animations are
   disabled.
8. Return the setting to **No emulation** and verify the normal animation
   returns.

## VoiceOver

To demonstrate screen-reader behavior:

- Open the app in Chrome.
- Press Command+F5 (or Fn+Command+F5) to turn on macOS VoiceOver.
- Navigate through the application to hear VoiceOver announce focused content.
- Drag and drop is keyboard operable, but drag-and-drop actions are not
  announced by VoiceOver. See Known Limitations in the README.
- Press Command+F5 (or Fn+Command+F5) again to turn VoiceOver off.
