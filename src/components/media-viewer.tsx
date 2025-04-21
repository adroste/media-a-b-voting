import { isImage, isVideo } from '@/lib/fs'
import { useObjectUrl } from '@/lib/use-object-url'

export interface MediaViewerProps {
  file: File
}

export function MediaViewer({ file }: Readonly<MediaViewerProps>) {
  const url = useObjectUrl(file)

  const blur = (e: React.FocusEvent<HTMLVideoElement>) => {
    if (e.currentTarget) {
      e.currentTarget.blur()
    }
  }

  if (isImage(file.name)) {
    return (
      <div className="flex justify-center items-center h-full max-h-full">
        <img className="max-h-full" src={url} alt={file.name} />
      </div>
    )
  }

  if (isVideo(file.name)) {
    return (
      <div className="flex justify-center items-center h-full max-h-full">
        <video className="max-h-full" controls onFocus={blur} muted autoPlay loop>
          <source key={url} src={url} />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <p>Unsupported file type: {file.type}</p>
    </div>
  )
}
