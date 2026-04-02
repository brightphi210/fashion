import { TbAward, TbCertificate, TbLayoutDashboard } from "react-icons/tb";

export const navigationLink = [
    {
        id: 1,
        name: 'Overview',
        path: '/admin/overview',
        icon: <TbLayoutDashboard />
    },
    {
        id: 2,
        name: 'Products',
        path: '/admin/products',
        icon: <TbCertificate />
    },
    {
        id: 3,
        name: 'Orders',
        path: '/admin/orders',
        icon: <TbAward />
    },
]
