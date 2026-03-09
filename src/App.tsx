import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import AuthProvider from './providers/AuthProvider'
import ProtectedRoute from './providers/ProtectedRoute'
import Login from './Pages/Login'
import Content from './content/Content'
import SideBar from './component/SideBar'
import Home from './Pages/Home'
import Categories from './Pages/Categories'
import Product from './Pages/Product'
import { ShopProvider } from './providers/ShopContext'
import Favourite from './Pages/Favorite'
import Cart from './Pages/Cart'
import Checkout from './Pages/Checkout'
import TransactionHistory from './Pages/TransactionHistory'

const App = () => {
  return (
    <AuthProvider>
      <ShopProvider>
        <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/favourites' element={<Favourite />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/transactions' element={<TransactionHistory />} />
          <Route path='/category/:slug' element={<Categories />} />
          <Route path='/product/:id' element={<Product />} />
          <Route
            path="*"
            element={
              <ProtectedRoute
                element={
                  <div className="flex min-h-screen bg-[#F8FAFC]">
                    <SideBar />
                    <div className="flex-1 ml-60">
                      <div className="mt-24 px-6">
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