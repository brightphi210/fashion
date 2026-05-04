import { Navigate, Route, Routes } from 'react-router-dom'
import AdminOrders from '../Pages/admin/AdminOrders'
import BroadcastMail from '../Pages/admin/BroadCastMail'
import Overview from '../Pages/admin/Overview'
import Products from '../Pages/admin/Products'

const Content = () => {
  return (
    <div className='main-content h-[98vh] w-full overflow-y-scroll'>
      <Routes>
        <Route path='/' element={<Navigate to={'/admin/overview'} />} />
        <Route path='/admin/overview' element={<Overview />} />
        <Route path='/admin/products' element={<Products />} />
        <Route path='/admin/orders' element={<AdminOrders />} />
        <Route path='/admin/broadcast' element={<BroadcastMail />} />
      </Routes>

    </div>
  )
}

export default Content
