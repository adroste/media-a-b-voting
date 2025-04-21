import { getFileNameFromPath, getParentDirFromPath } from './fs'
import { getItemsFromVotes } from './vote'
import { VotingDb } from './voting-db'

export function checkForRenamedItems(items: Set<string>, newItems: Set<string>): Map<string, string> {
  const renamedItems = new Map<string, string>()
  const newItemsArr = Array.from(newItems)

  for (const item of items) {
    if (newItems.has(item)) continue

    // Try to find a renamed version with a prefix/suffix
    const fileName = getFileNameFromPath(item, false)
    const parentDir = getParentDirFromPath(item)

    // simple check that tries to match files in the same directory
    // that got a prefix or suffix added
    // e.g. "file.mp4" -> "file (1).mp4" or "file (1) - Copy.mp4"
    // e.g. "file.mp4" -> "(1) file.mp4"
    const match = newItemsArr.find(newItem => {
      const newFileName = getFileNameFromPath(newItem, false)
      const newParentDir = getParentDirFromPath(newItem)
      return newParentDir === parentDir && newFileName.includes(fileName)
    })

    if (match) renamedItems.set(item, match)
  }

  return renamedItems
}

export function updateRenamedVotingDbItems(votingDb: VotingDb, newItems: Set<string>): VotingDb {
  votingDb = JSON.parse(JSON.stringify(votingDb)) as VotingDb
  const ratings = votingDb.ratings ?? {}
  const votes = votingDb.votes
  const starred = votingDb.starred ?? []

  const items = getItemsFromVotes(votes)
  starred.forEach(item => items.add(item))
  const renamedItems = checkForRenamedItems(items, newItems)

  renamedItems.forEach((newItem, oldItem) => {
    for (const vote of votes) {
      if (vote[0] === oldItem) vote[0] = newItem
      if (vote[1] === oldItem) vote[1] = newItem
    }

    for (let i = 0; i < starred.length; ++i) {
      const starredItem = starred[i]
      if (starredItem === oldItem) starred[i] = newItem
    }

    if (ratings[oldItem]) {
      ratings[newItem] = ratings[oldItem]
      delete ratings[oldItem]
    }
  })

  return { ...votingDb, ratings, votes, starred }
}
