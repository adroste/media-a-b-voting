import { Ratings } from '../rating'
import { getItemsFromVotes, Vote } from '../vote'

export function enforceDirectWins(betas: Ratings, votes: Vote[], winMargin = 1e-3): Ratings {
  betas = { ...betas }
  for (const [a, b, result] of votes) {
    const betaA = betas[a] ?? 0
    const betaB = betas[b] ?? 0
    if (result === 'a' && betaA <= betaB) {
      betas[a] = betaB + winMargin
    } else if (result === 'b' && betaB <= betaA) {
      betas[b] = betaA + winMargin
    }
  }
  return betas
}

export function trainDavidsonModel(
  votes: Vote[],
  iterations = 1000,
  learningRate = 0.01,
  initialTau = 1.0,
  lambda = 0.01,
): Ratings {
  const items = getItemsFromVotes(votes)
  const betas: Ratings = {}
  let tau = initialTau

  for (let iter = 0; iter < iterations; iter++) {
    const gradients: Ratings = {}
    let tauGrad = 0

    for (const [a, b, result] of votes) {
      const betaA = betas[a] ?? 0
      const betaB = betas[b] ?? 0
      let gradA = gradients[a] ?? 0
      let gradB = gradients[b] ?? 0

      const expA = Math.exp(betaA)
      const expB = Math.exp(betaB)
      const denom = expA + expB + tau

      const probA = expA / denom
      const probB = expB / denom

      if (result === 'a') {
        gradA += 1 - probA
        gradB -= probA
        tauGrad += -1 / denom
      } else if (result === 'b') {
        gradA -= probB
        gradB += 1 - probB
        tauGrad += -1 / denom
      } else if (result === 'tie') {
        const d = denom ** 2
        gradA += (-tau * expA) / d
        gradB += (-tau * expB) / d
        tauGrad += 1 / tau - 1 / denom
      }

      gradients[a] = gradA
      gradients[b] = gradB
    }

    for (const item of items) {
      const beta = betas[item] ?? 0
      const grad = gradients[item] ?? 0
      // L2 regularization: push beta back toward 0
      const regularizedGrad = grad - lambda * beta
      betas[item] = beta + learningRate * regularizedGrad
    }

    tau += learningRate * tauGrad
    if (tau < 1e-6) tau = 1e-6 // prevent zero or negative tau
  }

  return betas
}

export function findMostUncertainPairDavidson(
  items: string[],
  betas: Ratings,
  tau = 1.0,
): [string, string] | undefined {
  let mostUncertainPair: [string, string] | undefined = undefined
  let lowestConfidence = 1

  // Loop over all pairs of items
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      if (!a || !b) continue

      const betaA = betas[a] ?? 0
      const betaB = betas[b] ?? 0
      const expA = Math.exp(betaA)
      const expB = Math.exp(betaB)
      const denom = expA + expB + tau
      const probA = expA / denom

      const confidence = Math.abs(probA - 0.5) // close to 0 = uncertain, close to 0.5 = certain

      // If this pair has more uncertainty than the previous best pair, update
      if (confidence < lowestConfidence) {
        lowestConfidence = confidence
        mostUncertainPair = [a, b]
      }
    }
  }

  return mostUncertainPair
}
