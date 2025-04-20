import { Button } from './ui/button'
import { Key } from './ui/key'
import { useKeyboardShortcut } from '@/lib/use-keyboard-shortcut'

export interface VotingActionsProps {
  undo: () => void
  pick: (vote: 'a' | 'b' | 'tie') => void
  openDirectory: () => void
  disableVoting: boolean
  disableUndo: boolean
}

export function VotingActions({ undo, pick, openDirectory, disableVoting, disableUndo }: Readonly<VotingActionsProps>) {
  useKeyboardShortcut('ArrowLeft', () => pick('a'), !disableVoting)
  useKeyboardShortcut('ArrowRight', () => pick('b'), !disableVoting)
  useKeyboardShortcut('ArrowDown', () => pick('tie'), !disableVoting)
  useKeyboardShortcut('ArrowUp', undo, !disableUndo)

  return (
    <div className="space-x-2 p-4 flex items-center justify-center">
      <Button className="mr-10" variant="outline" onClick={openDirectory}>
        Open directory
      </Button>
      <Button variant="outline" disabled={disableVoting} onClick={() => pick('a')}>
        Pick Left <Key name="←" />
      </Button>
      <Button variant="outline" disabled={disableVoting} onClick={() => pick('tie')}>
        Tie <Key name="↓" />
      </Button>
      <Button variant="outline" disabled={disableVoting} onClick={() => pick('b')}>
        Pick Right <Key name="→" />
      </Button>
      <Button className="ml-10" variant="outline" disabled={disableUndo} onClick={undo}>
        Undo <Key name="↑" />
      </Button>
    </div>
  )
}
