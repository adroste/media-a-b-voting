import { shuffleArray } from './shuffle-array'
import { getAlreadyVotedPairs, getVoteCountByItem, getVotePairKey, Vote } from './vote'

export type Ratings = Record<string, number>

export function findNextPair(items: string[], votes: Vote[]): [string, string] | undefined {
  const shuffledItems = shuffleArray(items) // pre-shuffle (even though we will sort later, but the sort is stable)
  const voteCountByItem = getVoteCountByItem(votes)
  const sortedItems = [...shuffledItems].sort((a, b) => (voteCountByItem[a] ?? 0) - (voteCountByItem[b] ?? 0))
  const excludedPairs = getAlreadyVotedPairs(votes)

  // try to find a pair with the least votes
  for (let i = 0; i < sortedItems.length; i++) {
    for (let j = i + 1; j < sortedItems.length; j++) {
      const a = sortedItems[i]
      const b = sortedItems[j]
      if (!a || !b) continue
      const pairKey = getVotePairKey([a, b])

      if (!excludedPairs.has(pairKey)) {
        return [a, b]
      }
    }
  }
  return undefined
}
