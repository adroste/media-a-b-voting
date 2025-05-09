import { useVoting } from '@/lib/use-voting'
import { VotingActions } from './voting-actions'
import { MediaPane } from './media-pane'
import { DEFAULT_ELO } from '@/lib/rating/elo'

export function ABVoting() {
  const { ratings, nextPair, fileMap, pick, undo, votes, openDirectory, starredItems, star } = useVoting()

  const disableVoting = !nextPair
  const disableUndo = votes.length === 0

  const itemA = nextPair?.[0]
  const itemB = nextPair?.[1]
  const fileA = fileMap.get(itemA ?? '')
  const fileB = fileMap.get(itemB ?? '')
  const ratingA = ratings[itemA ?? ''] ?? DEFAULT_ELO
  const ratingB = ratings[itemB ?? ''] ?? DEFAULT_ELO

  return (
    <div className="dark bg-stone-900 text-gray-50 min-h-screen w-full h-screen flex flex-col items-center justify-center">
      <div className="flex-1 w-full flex items-center justify-center gap-4 overflow-hidden">
        {disableVoting ? (
          <div className="flex text-2xl text-gray-400 justify-center items-center h-full max-h-full">
            No files left to vote on
          </div>
        ) : (
          <>
            <div className="flex-1 shrink-0 h-full max-h-full min-w-0">
              <MediaPane item={itemA} file={fileA} rating={ratingA} star={star} starredItems={starredItems} />
            </div>
            <div className="flex-1 shrink-0 h-full max-h-full min-w-0">
              <MediaPane item={itemB} file={fileB} rating={ratingB} star={star} starredItems={starredItems} />
            </div>
          </>
        )}
      </div>

      <div className="space-x-2 w-full flex items-center justify-center">
        <VotingActions
          openDirectory={openDirectory}
          undo={undo}
          pick={pick}
          disableVoting={disableVoting}
          disableUndo={disableUndo}
        />
        <div className="text-gray-400 text-sm">
          Votes: <span className="absolute pl-2">{votes.length}</span>
        </div>
      </div>
    </div>
  )
}
