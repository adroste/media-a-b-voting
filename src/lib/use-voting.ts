import { useCallback, useMemo, useState } from 'react'
import { getAlreadyVotedPairs, Vote } from './vote'
import { getFullPath, isImage, isVideo, walkFiles } from './fs'
import throttle from 'lodash/throttle'
import { boostEloRatings, findMostUncertainPairElo, trainEloModel } from './rating/elo'
import { readVotingDbFile, writeVotingDbFile } from './voting-db'

const VOTING_JSON_WRITE_INTERVAL_MS = 10000

function findNextPairToVoteOn(items: string[], votes: Vote[]): [string, string] | undefined {
  const alreadyVotedPairs = getAlreadyVotedPairs(votes)
  const ratings = trainEloModel(votes, 5)
  const mostUncertainPair = findMostUncertainPairElo(items, ratings, alreadyVotedPairs)
  return mostUncertainPair
}

const saveVotingDb = throttle(
  (rootDirHandle: FileSystemDirectoryHandle | undefined, votes: Vote[], starredItems: Set<string>) => {
    if (!rootDirHandle) return
    const starred = [...starredItems]

    let ratings = trainEloModel(votes)
    ratings = boostEloRatings(starred, ratings)

    writeVotingDbFile(rootDirHandle, { ratings, starred, votes })
  },
  VOTING_JSON_WRITE_INTERVAL_MS,
  { leading: false, trailing: true },
)

export function useVoting() {
  const [rootDirHandle, setRootDirHandle] = useState<FileSystemDirectoryHandle>()
  const [fileMap, setFileMap] = useState<Map<string, File>>(() => new Map())

  const [votes, setVotes] = useState<Vote[]>([])
  const [starredItems, setStarredItems] = useState<Set<string>>(() => new Set())

  const [nextPair, setNextPair] = useState<[string, string] | undefined>()

  const openDirectory = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      alert('Browser not supported')
      throw new Error('Browser not supported')
    }
    const dirHandle = await showDirectoryPicker({ id: 'dir', mode: 'readwrite' })
    const { fileHandles, parentMap } = await walkFiles(dirHandle, true)

    const mediaFileHandles = fileHandles.filter(handle => isImage(handle.name) || isVideo(handle.name))
    const mediaFiles: File[] = await Promise.all(mediaFileHandles.map(async fileHandle => await fileHandle.getFile()))
    const fileMap = new Map<string, File>()
    mediaFileHandles.forEach((fileHandle, i) => {
      const file = mediaFiles[i]
      if (!file) throw new Error('file undefined, this should never happen')
      const fullPath = getFullPath(fileHandle, parentMap)
      fileMap.set(fullPath, file)
    })

    let votes: Vote[] = []
    let starredItems = new Set<string>()
    try {
      const votingDb = await readVotingDbFile(dirHandle)
      votes = votingDb.votes
      starredItems = new Set(votingDb.starred ?? [])
    } catch (err) {
      console.error(err)
    }

    setRootDirHandle(dirHandle)
    setFileMap(fileMap)
    setVotes(votes)
    setStarredItems(starredItems)
    setNextPair(findNextPairToVoteOn([...fileMap.keys()], votes))
  }, [])

  const pick = useCallback(
    (pick: 'a' | 'b' | 'tie') => {
      if (!nextPair) return
      const [a, b] = nextPair
      const updatedVotes: Vote[] = [...votes, [a, b, pick]]
      setVotes(updatedVotes)
      saveVotingDb(rootDirHandle, updatedVotes, starredItems)
      setNextPair(findNextPairToVoteOn([...fileMap.keys()], updatedVotes))
    },
    [fileMap, nextPair, rootDirHandle, starredItems, votes],
  )

  const undo = useCallback(() => {
    const updatedVotes = [...votes]
    const lastVote = updatedVotes.pop()
    setVotes(updatedVotes)
    saveVotingDb(rootDirHandle, updatedVotes, starredItems)
    if (lastVote) setNextPair([lastVote[0], lastVote[1]])
  }, [rootDirHandle, starredItems, votes])

  const star = useCallback(
    (item: string, star: boolean) => {
      const updatedStarredItems = new Set(starredItems)
      if (star) updatedStarredItems.add(item)
      else updatedStarredItems.delete(item)
      setStarredItems(updatedStarredItems)
      saveVotingDb(rootDirHandle, votes, updatedStarredItems)
    },
    [rootDirHandle, starredItems, votes],
  )

  return useMemo(
    () => ({
      votes,
      nextPair,
      fileMap,
      pick,
      undo,
      openDirectory,
      star,
      starredItems,
    }),
    [votes, fileMap, nextPair, pick, undo, openDirectory, star, starredItems],
  )
}
