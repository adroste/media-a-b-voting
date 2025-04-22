export type Vote = [string, string, 'a' | 'b' | 'tie']

export function getVotePairKey(pair: [string, string]): string {
  const [a, b] = pair[0].localeCompare(pair[1]) <= 0 ? pair : [pair[1], pair[0]]
  return `${a}::${b}`
}

export function getAlreadyVotedPairs(votes: Vote[]): Set<string> {
  const alreadyVotedPairs = new Set<string>()
  for (const vote of votes) {
    const [a, b] = vote
    alreadyVotedPairs.add(getVotePairKey([a, b]))
  }
  return alreadyVotedPairs
}

export function getItemsFromVotes(votes: Vote[]): Set<string> {
  const items = new Set<string>()
  for (const [a, b] of votes) {
    items.add(a)
    items.add(b)
  }
  return items
}

export function getVoteCountByItem(votes: Vote[]): Record<string, number> {
  const voteCountByItem: Record<string, number> = {}
  for (const [a, b] of votes) {
    voteCountByItem[a] = (voteCountByItem[a] || 0) + 1
    voteCountByItem[b] = (voteCountByItem[b] || 0) + 1
  }
  return voteCountByItem
}
