import { type ReactNode } from 'react'

export interface ButtonProps {
  children: ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps): JSX.Element {
  return <button onClick={onClick}>{children}</button>
}
