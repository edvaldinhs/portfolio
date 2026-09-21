import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AOS from 'aos'
import { ScrollTrigger } from './lib/gsap'
import { ThemeProvider } from './hooks/useTheme'
import { LenisProvider } from './hooks/useLenis'
import Preloader from './components/Preloader'
import CustomCursor from './components/CustomCursor'
import ThemeSwitcher from './components/ThemeSwitcher'
import Home from './pages/Home'
import About from './pages/About'
import WhatCanIDoPage from './pages/WhatCanIDoPage'

function Layout() {
  const location = useLocation()

  useEffect(() => {
    AOS.init()
    AOS.refresh()
  }, [])

  useEffect(() => {
    ScrollTrigger.refresh()
    AOS.refresh()
  }, [location.pathname])

  return (
    <>
      <Preloader />
      <CustomCursor />
      <ThemeSwitcher />
      <div className="layer-blur" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/what-can-i-do" element={<WhatCanIDoPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LenisProvider>
        <Layout />
      </LenisProvider>
    </ThemeProvider>
  )
}