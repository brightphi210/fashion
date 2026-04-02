import { useState } from 'react'
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

const App = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
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
  )
}

export default App