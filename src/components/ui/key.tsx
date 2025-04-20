export interface KeyProps {
  name: string
}

export function Key({ name }: Readonly<KeyProps>) {
  return (
    <span className="rounded border text-xs border-gray-400 w-4 h-4 inline-flex justify-center items-center">
      {name}
    </span>
  )
}
