import { Ratings } from '../rating'
import { shuffleArray } from '../shuffle-array'
import { getVotePairKey, Vote } from '../vote'

export const DEFAULT_ELO = 1000
const DEFAULT_KFACTOR = 200
const DEFAULT_ITERATIONS = 1000

function calculateElo(score: number, expected: number, actual: number, kFactor: number): number {
  return score + kFactor * (actual - expected)
}

function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 480))
}

export function trainEloModel(votes: Vote[], iterations = DEFAULT_ITERATIONS, kFactor = DEFAULT_KFACTOR): Ratings {
  const ratings: Ratings = {}
  const adjustedKFactor = kFactor / iterations

  for (let iter = 0; iter < iterations; iter++) {
    // Shuffle votes to avoid bias
    const shuffledVotes = shuffleArray(votes)

    for (const [a, b, result] of shuffledVotes) {
      const ratingA = ratings[a] ?? DEFAULT_ELO
      const ratingB = ratings[b] ?? DEFAULT_ELO

      const expectedA = calculateExpectedScore(ratingA, ratingB)
      const expectedB = calculateExpectedScore(ratingB, ratingA)

      let actualA = 0.5
      let actualB = 0.5 // 0.5 default for tie
      if (result === 'a') {
        actualA = 1
        actualB = 0
      } else if (result === 'b') {
        actualA = 0
        actualB = 1
      }

      ratings[a] = calculateElo(ratingA, expectedA, actualA, adjustedKFactor)
      ratings[b] = calculateElo(ratingB, expectedB, actualB, adjustedKFactor)
    }
  }

  return ratings
}

export function findMostUncertainPairElo(
  items: string[],
  eloRatings: Ratings,
  excludedPairs: Set<string>,
): [string, string] | undefined {
  let mostUncertainPair: [string, string] | undefined = undefined
  let lowestConfidence = 1

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      if (!a || !b) continue

      // skip pairs that are excluded (already voted)
      const pairKey = getVotePairKey([a, b])
      if (excludedPairs.has(pairKey)) continue

      const ratingA = eloRatings[a] ?? DEFAULT_ELO
      const ratingB = eloRatings[b] ?? DEFAULT_ELO
      const probA = calculateExpectedScore(ratingA, ratingB)
      const confidence = Math.abs(probA - 0.5) // close to 0 = uncertain, close to 0.5 = certain

      if (confidence < lowestConfidence) {
        lowestConfidence = confidence
        mostUncertainPair = [a, b]
      }
    }
  }

  return mostUncertainPair
}

export function findMostUncertainPairEloFast(
  items: string[],
  eloRatings: Ratings,
  excludedPairs: Set<string>,
): [string, string] | undefined {
  const sortedItems = [...items].sort((a, b) => (eloRatings[a] ?? DEFAULT_ELO) - (eloRatings[b] ?? DEFAULT_ELO))

  let mostUncertainPair: [string, string] | undefined = undefined
  let lowestEloDistance = Infinity

  for (let step = 1; step < sortedItems.length; ++step) {
    for (let i = 0; i < sortedItems.length - step; ++i) {
      const a = sortedItems[i]
      const b = sortedItems[i + step]
      if (!a || !b) continue

      // skip pairs that are excluded (already voted)
      const pairKey = getVotePairKey([a, b])
      if (excludedPairs.has(pairKey)) continue

      const ratingA = eloRatings[a] ?? DEFAULT_ELO
      const ratingB = eloRatings[b] ?? DEFAULT_ELO

      const eloDistance = Math.abs(ratingA - ratingB)

      if (eloDistance < lowestEloDistance) {
        lowestEloDistance = eloDistance
        mostUncertainPair = [a, b]
      }
    }

    if (mostUncertainPair) return mostUncertainPair
  }

  return undefined
}

export function boostEloRatings(items: Set<string>, ratings: Ratings, kFactor = DEFAULT_KFACTOR): Ratings {
  const boostedRatings: Ratings = { ...ratings }

  const ratingValues = Object.values(ratings)
  const avgRating = ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length

  for (const item of items) {
    const rating = boostedRatings[item] ?? DEFAULT_ELO
    // boost by one virtual win against the average
    const expected = calculateExpectedScore(rating, avgRating)
    const newElo = calculateElo(rating, expected, 1, kFactor)
    boostedRatings[item] = newElo
  }

  return boostedRatings
}

export function bucketByEloRangeWithCounts(
  ratings: Record<string, number>,
  numberOfBuckets = 10,
): Record<number, number> {
  if (numberOfBuckets < 1) throw new Error('Must request at least one bucket.')

  const elos = Object.values(ratings)

  const minElo = Math.floor(Math.min(...elos) ?? 0)
  const maxElo = Math.floor(Math.max(...elos) ?? DEFAULT_ELO)

  const range = maxElo - minElo || 1 // avoid zero range
  const bucketSize = Math.floor(range / numberOfBuckets)

  const counts: Record<number, number> = {}

  for (let i = 0; i < numberOfBuckets; i++) {
    const bucketStart = minElo + i * bucketSize
    const bucketEnd = i === numberOfBuckets - 1 ? Infinity : minElo + (i + 1) * bucketSize
    counts[bucketStart] = elos.filter(elo => elo >= bucketStart && elo < bucketEnd).length
  }

  return counts
}
