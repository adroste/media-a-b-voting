export function isImage(fileName: string) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg']
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ext ? imageExtensions.includes(ext) : false
}

export function isVideo(fileName: string) {
  const videoExtensions = ['mp4', 'mkv', 'webm', 'avi', 'mov', 'wmv', 'flv', 'm4v']
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ext ? videoExtensions.includes(ext) : false
}

export function getFullPath(
  handle: FileSystemHandle,
  parentMap: Map<FileSystemHandle, FileSystemDirectoryHandle>,
): string {
  const parentNames: string[] = []
  let currentHandle: FileSystemHandle | undefined = handle
  while (currentHandle) {
    parentNames.push(currentHandle.name)
    currentHandle = parentMap.get(currentHandle)
  }
  parentNames.pop() // exclude root dir
  return parentNames.reverse().join('/')
}

export function getCombinedParentPath(
  handle: FileSystemHandle,
  parentMap: Map<FileSystemHandle, FileSystemDirectoryHandle>,
): string {
  const parentNames: string[] = []
  let currentHandle: FileSystemHandle | undefined = parentMap.get(handle)
  while (currentHandle) {
    parentNames.push(currentHandle.name)
    currentHandle = parentMap.get(currentHandle)
  }
  return parentNames.reverse().join('/')
}

export async function walkFiles(dirHandle: FileSystemDirectoryHandle, recursive: boolean) {
  const fileHandles: FileSystemFileHandle[] = []
  const parentMap = new Map<FileSystemHandle, FileSystemDirectoryHandle>()
  for await (const handle of dirHandle.values()) {
    parentMap.set(handle, dirHandle)
    if (handle.kind === 'file') {
      fileHandles.push(handle)
    } else if (recursive && handle.kind === 'directory') {
      const inner = await walkFiles(handle, recursive)
      fileHandles.push(...inner.fileHandles)
      for (const [handle, parentHandle] of inner.parentMap.entries()) {
        parentMap.set(handle, parentHandle)
      }
    }
  }
  return { fileHandles, parentMap }
}

export function getFileNameFromPath(path: string, withExtension = true) {
  const parts = path.split('/')
  const fileName = parts[parts.length - 1] ?? ''
  if (withExtension) return fileName
  const dotIndex = fileName.lastIndexOf('.')
  return fileName.slice(0, dotIndex === -1 ? undefined : dotIndex)
}

export function getParentDirFromPath(path: string) {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/')
}
