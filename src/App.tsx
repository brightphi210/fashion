import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashboardNavbar from './component/DashboardNavbar'
import SideBar from './component/SideBar'
import Content from './content/Content'
import './index.css'
import Cart from './Pages/Cart'
import Categories from './Pages/Categories'
import Checkout from './Pages/Checkout'
import Favourite from './Pages/Favorite'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Orders from './Pages/Orders'
import OrderSuccess from './Pages/OrderSuccess'
import OTPVerify from './Pages/OTPVerify'
import Product from './Pages/Product'
import SearchResults from './Pages/Searchresults'
import AuthProvider from './providers/AuthProvider'
import ProtectedRoute from './providers/ProtectedRoute'
import { ShopProvider } from './providers/ShopContext'

const BRAND = '6ixunit'
const TOTAL_DURATION = 6500 // ms

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [visibleChars, setVisibleChars] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Spread letter reveals across first 2 seconds
    const charInterval = 2400 / BRAND.length

    const timers: ReturnType<typeof setTimeout>[] = []

    BRAND.split('').forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleChars(i + 1)
        }, i * charInterval)
      )
    })

    // Start fade-out at 2.4s, complete at 3s
    timers.push(setTimeout(() => setFadeOut(true), 2400))
    timers.push(setTimeout(() => onComplete(), TOTAL_DURATION))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.04em' }}>
        {BRAND.split('').map((char, i) => (
          <span
            key={i}
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 10vw, 6rem)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#fff',
              opacity: i < visibleChars ? 1 : 0,
              transform: i < visibleChars ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.25s ease, transform 0.3s ease',
              display: 'inline-block',
            }}
          >
            {char}
          </span>
        ))}

        {/* Blinking cursor */}
        <span
          style={{
            display: 'inline-block',
            width: '3px',
            height: 'clamp(2rem, 8vw, 5rem)',
            backgroundColor: '#fff',
            marginLeft: '4px',
            opacity: visibleChars < BRAND.length ? 1 : 0,
            animation: visibleChars < BRAND.length ? 'blink 0.7s step-end infinite' : 'none',
            transition: 'opacity 0.3s ease',
            alignSelf: 'center',
          }}
        />
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const App = () => {
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <AuthProvider>
        <ShopProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/verify-otp' element={<OTPVerify />} />
              <Route path='/favourites' element={<Favourite />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/checkout' element={<Checkout />} />
              <Route path='/order-success' element={<OrderSuccess />} />
              <Route path='/orders' element={<Orders />} />
              <Route path='/search' element={<SearchResults />} />
              <Route path='/category/:slug' element={<Categories />} />
              <Route path='/product/:id' element={<Product />} />
              <Route
                path="*"
                element={
                  <ProtectedRoute
                    element={
                      <div className="flex min-h-screen bg-[#F8FAFC]">
                        <SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                        <div className="flex-1 md:ml-60">
                          <DashboardNavbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                          <div className="mt-20 p-4 md:mt-24 md:px-6">
                            <Content />
                          </div>
                        </div>
                      </div>
                    }
                  />
                }
              />
            </Routes>
          </BrowserRouter>
        </ShopProvider>
      </AuthProvider>
    </>
  )
}

export default App