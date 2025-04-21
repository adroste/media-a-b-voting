import { Vote } from './vote'

const VOTING_DB_FILE_NAME = '__voting_db.json'

export interface VotingDb {
  votes: Vote[]
  starred?: string[]
  ratings?: Record<string, number>
  buckets?: Record<number, number>
}

function isVotingDb(data: unknown): data is VotingDb {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as VotingDb).votes) &&
    (data as VotingDb).votes.every(
      vote =>
        Array.isArray(vote) &&
        vote.length === 3 &&
        typeof vote[0] === 'string' &&
        typeof vote[1] === 'string' &&
        typeof vote[2] === 'string',
    )
  )
}

function votingDbToJsonPretty(data: VotingDb): string {
  // sort ratings by highest rating first
  let sortedRatings: Record<string, number> = {}
  if (data.ratings) {
    const sorted = Object.entries(data.ratings).sort(([, a], [, b]) => b - a)
    sortedRatings = Object.fromEntries(sorted)
  }

  const output: VotingDb = {
    buckets: data.buckets,
    starred: data.starred,
    ratings: sortedRatings,
    votes: data.votes,
  }

  return JSON.stringify(output, null, 2)
}

export async function readVotingDbFile(dirHandle: FileSystemDirectoryHandle): Promise<VotingDb> {
  const fileHandle = await dirHandle.getFileHandle(VOTING_DB_FILE_NAME)
  const file = await fileHandle.getFile()
  const data = await file.text()
  const json = JSON.parse(data)
  if (!isVotingDb(json)) throw new Error(`${VOTING_DB_FILE_NAME} invalid`)
  return json
}

export async function writeVotingDbFile(dirHandle: FileSystemDirectoryHandle, data: VotingDb) {
  console.log(`write: ${VOTING_DB_FILE_NAME}`)
  const fileHandle = await dirHandle.getFileHandle(VOTING_DB_FILE_NAME, { create: true })
  const writable = await fileHandle.createWritable()
  const json = votingDbToJsonPretty(data)
  await writable.write(json)
  await writable.close()
}
