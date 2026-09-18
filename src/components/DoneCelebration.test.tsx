import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DoneCelebration from './DoneCelebration'

describe('DoneCelebration', () => {
  it('renders the completed task character', () => {
    render(
      <DoneCelebration
        character={{
          id: '1',
          name: 'Rick Sanchez',
          image: 'https://example.com/rick.png',
        }}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Rick Sanchez made it to Done!',
    )
    expect(
      screen.getByRole('heading', { name: 'DONE! 🎉' }),
    ).toBeInTheDocument()

    const image = document.querySelector('.done-celebration-image')
    expect(image).toHaveAttribute('src', 'https://example.com/rick.png')
    expect(image).toHaveAttribute('alt', '')
  })
})
