import type { Character } from '../types'

type DoneCelebrationProps = {
  character: Character
}

const confettiPieces = Array.from({ length: 40 }, (_, index) => index)

function DoneCelebration({ character }: DoneCelebrationProps) {
  return (
    // Announce completion without moving focus away from the board interaction.
    <div className="done-celebration" role="status" aria-live="polite">
      <div className="confetti" aria-hidden="true">
        {confettiPieces.map((piece) => (
          <span key={piece} />
        ))}
      </div>
      <div className="done-celebration-content">
        <h2>DONE! 🎉</h2>
        <img
          className="done-celebration-image"
          src={character.image}
          alt={character.name}
        />
        <p>{character.name} made it to Done!</p>
      </div>
    </div>
  )
}

export default DoneCelebration
