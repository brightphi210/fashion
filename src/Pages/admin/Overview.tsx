import { useState } from "react";
import {
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiDollarSign,
    FiPackage,
    FiPlus,
    FiRefreshCw,
    FiShoppingBag, FiShoppingCart,
    FiTrendingUp,
    FiTruck,
    FiXCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import AddEditProductModal from "../../component/AddProductModal";
import { useGetOrders, useGetProducts } from "../../hooks/mutations/allMutation";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.6ixunit.store";
const getMediaUrl = (path: any) => {
    if (!path || typeof path !== "string") return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}/media/${path}`;
};
const safeStr = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") return String(val.label ?? val.name ?? val.title ?? val.slug ?? "");
    return String(val);
};

const STATUS_CFG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <FiClock size={10} /> },
    confirmed: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: <FiCheckCircle size={10} /> },
    processing: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: <FiPackage size={10} /> },
    shipped: { color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: <FiTruck size={10} /> },
    delivered: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: <FiCheckCircle size={10} /> },
    cancelled: { color: "text-red-500", bg: "bg-red-50", border: "border-red-200", icon: <FiXCircle size={10} /> },
    refunded: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", icon: <FiRefreshCw size={10} /> },
};
const PAY_CFG: Record<string, { color: string; bg: string }> = {
    paid: { color: "text-green-600", bg: "bg-green-50" },
    unpaid: { color: "text-amber-600", bg: "bg-amber-50" },
    failed: { color: "text-red-500", bg: "bg-red-50" },
    refunded: { color: "text-gray-500", bg: "bg-gray-50" },
};

const StatCard = ({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon: React.ReactNode; accent: string }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent}`}>{icon}</div>
        <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-400 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-gray-300 mt-0.5">{sub}</p>}
    </div>
);

const Overview = () => {
    const { products, isLoading: loadProd } = useGetProducts();
    const { orders, isLoading: loadOrd } = useGetOrders();
    const [showAdd, setShowAdd] = useState(false);

    const allProducts: any[] = Array.isArray(products?.data) ? products.data : [];
    const allOrders: any[] = Array.isArray(orders?.data) ? orders.data : [];

    const totalRevenue = allOrders.filter(o => o.payment_status === "paid")
        .reduce((s, o) => s + parseFloat(o.total_amount || "0"), 0);
    const paidCount = allOrders.filter(o => o.payment_status === "paid").length;
    const pendingCount = allOrders.filter(o => o.status === "pending").length;

    const recentProducts = allProducts.slice(0, 4);
    const recentOrders = allOrders.slice(0, 6);

    return (
        <div className="p-6 space-y-7 max-w-6xl">
            {showAdd && <AddEditProductModal onClose={() => setShowAdd(false)} />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's your store overview.</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-colors">
                    <FiPlus size={15} /> Add Product
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loadProd || loadOrd
                    ? [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 mb-4" />
                            <div className="h-6 w-20 bg-gray-100 rounded-lg mb-1.5" />
                            <div className="h-3 w-16 bg-gray-100 rounded-full" />
                        </div>
                    ))
                    : <>
                        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={<FiDollarSign size={18} />} accent="bg-green-50 text-green-600" />
                        <StatCard label="Total Orders" value={String(allOrders.length)} sub={`${paidCount} paid · ${pendingCount} pending`} icon={<FiShoppingCart size={18} />} accent="bg-blue-50 text-blue-600" />
                        <StatCard label="Products" value={String(allProducts.length)} icon={<FiShoppingBag size={18} />} accent="bg-purple-50 text-purple-600" />
                        <StatCard label="Avg Order Value" value={paidCount ? `$${(totalRevenue / paidCount).toFixed(2)}` : "$0.00"} icon={<FiTrendingUp size={18} />} accent="bg-amber-50 text-amber-600" />
                    </>
                }
            </div>

            {/* Recent Products */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-gray-800">Recent Products</h2>
                    <Link to="/admin/products" className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors">
                        See all <FiChevronRight size={12} />
                    </Link>
                </div>
                {loadProd ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                <div className="bg-gray-100 aspect-square" />
                                <div className="p-3 space-y-2"><div className="h-3 w-3/4 bg-gray-100 rounded-full" /><div className="h-3 w-1/2 bg-gray-100 rounded-full" /></div>
                            </div>
                        ))}
                    </div>
                ) : recentProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center">
                        <FiShoppingBag size={28} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No products yet.</p>
                        <button onClick={() => setShowAdd(true)} className="mt-2 text-xs font-black text-black underline underline-offset-2">Add your first product</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {recentProducts.map((p: any) => {
                            const price = parseFloat(p.price) || 0;
                            const oldPrice = p.old_price ? parseFloat(p.old_price) : null;
                            const discount = p.discount ? Number(p.discount) : null;
                            return (
                                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 group">
                                    <div className="aspect-square bg-gray-50 overflow-hidden relative">
                                        <img src={getMediaUrl(p.img ?? p.image ?? "")} alt={safeStr(p.name)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {discount && (
                                            <span className="absolute top-2 left-2 text-[9px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-md">-{discount}%</span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs font-black text-gray-800 truncate">{safeStr(p.name)}</p>
                                        <div className="flex items-baseline gap-1.5 mt-1">
                                            <span className="text-xs font-black text-gray-900">${price.toFixed(2)}</span>
                                            {oldPrice && <span className="text-[10px] text-gray-300 line-through">${oldPrice.toFixed(2)}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent Orders */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-gray-800">Recent Orders</h2>
                    <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors">
                        See all <FiChevronRight size={12} />
                    </Link>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {loadOrd ? (
                        <div className="divide-y divide-gray-50">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="px-5 py-3.5 flex items-center gap-4 animate-pulse">
                                    <div className="h-3 w-28 bg-gray-100 rounded-full" /><div className="h-3 w-24 bg-gray-100 rounded-full" />
                                    <div className="h-3 w-14 bg-gray-100 rounded-full ml-auto" /><div className="h-5 w-16 bg-gray-100 rounded-full" /><div className="h-5 w-20 bg-gray-100 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="py-12 text-center"><FiShoppingCart size={28} className="text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">No orders yet.</p></div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recentOrders.map((order: any) => {
                                const sc = STATUS_CFG[order.status] ?? STATUS_CFG.pending;
                                const pc = PAY_CFG[order.payment_status] ?? PAY_CFG.unpaid;
                                return (
                                    <div key={order.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-black text-gray-800">#{order.order_number}</p>
                                            <p className="text-[11px] text-gray-400">{order.shipping_first_name} {order.shipping_last_name}</p>
                                        </div>
                                        <span className="text-xs font-black text-gray-700 tabular-nums whitespace-nowrap">${parseFloat(order.total_amount || "0").toFixed(2)}</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pc.color} ${pc.bg}`}>{order.payment_status}</span>
                                        <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${sc.color} ${sc.bg} ${sc.border}`}>
                                            {sc.icon}<span className="capitalize">{order.status}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;