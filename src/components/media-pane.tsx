import { Button } from './ui/button'
import { StarIcon } from 'lucide-react'
import { MediaViewer } from './media-viewer'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface MediaPaneProps {
  file?: File
  item?: string
  starredItems: Set<string>
  star: (item: string, star: boolean) => void
}

export function MediaPane({ item, file, starredItems, star }: Readonly<MediaPaneProps>) {
  const isStarred = starredItems.has(item ?? '')

  const toggleStar = useCallback(() => {
    if (!item) return
    star(item, !isStarred)
  }, [isStarred, item, star])

  if (!file || !item) {
    return (
      <div className="flex text-2xl text-gray-400 justify-center items-center h-full max-h-full">No file to view</div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex justify-center items-center">
        <Button size="icon" variant="ghost" onClick={toggleStar}>
          <StarIcon size={16} className={cn('stroke-gray-400', { 'fill-amber-300 stroke-amber-300': isStarred })} />
        </Button>
        <div className="text-xs text-gray-700 text-center">{file.name}</div>
      </div>
      <div className="flex-1 overflow-hidden">
        <MediaViewer key={file.name} file={file} />
      </div>
    </div>
  )
}
