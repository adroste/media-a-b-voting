import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ABVoting } from './components/ab-voting.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ABVoting />
  </StrictMode>,
)
