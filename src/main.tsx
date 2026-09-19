import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/style.scss'
import './styles/loading.scss'
import './styles/grid.scss'
import './styles/footer.scss'
import './styles/cards/ydde.scss'
import './styles/cards/gecco.scss'
import './styles/cards/istudy.scss'
import './styles/cards/yde.scss'
import 'aos/dist/aos.css'
import 'lenis/dist/lenis.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)