console.log("🚀 O ARQUIVO MAIN.JSX CARREGOU!");
console.log("Variavel de teste:", import.meta.env.VITE_API_URL);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Router from './routes/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </StrictMode>
)
