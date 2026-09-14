import type { Character } from '../types'

export const RICK_AND_MORTY_GRAPHQL_ENDPOINT =
  'https://rickandmortyapi.com/graphql'

const CHARACTERS_QUERY = `
  query GetCharacters {
    characters(page: 1) {
      results {
        id
        name
        image
      }
    }
  }
`

type GraphQLCharacterResult = {
  id?: unknown
  name?: unknown
  image?: unknown
} | null

type CharactersResponse = {
  data?: {
    characters?: {
      results?: GraphQLCharacterResult[]
    }
  }
  errors?: unknown[]
}

function isCharactersResponse(value: unknown): value is CharactersResponse {
  return typeof value === 'object' && value !== null
}

function toCharacter(result: GraphQLCharacterResult): Character | null {
  if (result === null) {
    return null
  }

  if (
    typeof result.id !== 'string' ||
    typeof result.name !== 'string' ||
    typeof result.image !== 'string'
  ) {
    throw new Error('Invalid character data received.')
  }

  return {
    id: result.id,
    name: result.name,
    image: result.image,
  }
}

export async function fetchCharacters(): Promise<Character[]> {
  const response = await fetch(RICK_AND_MORTY_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: CHARACTERS_QUERY }),
  })

  if (!response.ok) {
    throw new Error('Unable to load characters.')
  }

  const json: unknown = await response.json()

  if (!isCharactersResponse(json)) {
    throw new Error('Invalid character response received.')
  }

  if (json.errors && json.errors.length > 0) {
    throw new Error('Unable to load characters.')
  }

  const results = json.data?.characters?.results

  if (!Array.isArray(results)) {
    throw new Error('Invalid character response received.')
  }

  return results
    .map((result) => toCharacter(result))
    .filter((character): character is Character => character !== null)
}
