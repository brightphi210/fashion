import { useState } from "react";
import {
    FiArrowRight,
    FiBox,
    FiChevronRight,
    FiPackage,
    FiRefreshCw,
    FiTruck,
    FiXCircle,
} from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useGetOrders } from "../hooks/mutations/allMutation";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderItem = {
    id: number;
    product_name: string;
    product_img: string;
    color: string;
    size: string;
    unit_price: string;
    quantity: number;
    subtotal: string;
};

type Order = {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    shipping_method: string;
    shipping_fee: string;
    subtotal: string;
    total_amount: string;
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_city: string;
    shipping_country: string;
    created_at: string;
    items: OrderItem[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
// const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.6ixunit.store";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    confirmed: { label: "Confirmed", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <FiPackage size={11} /> },
    processing: { label: "Processing", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <FiRefreshCw size={11} /> },
    shipped: { label: "Shipped", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", icon: <FiTruck size={11} /> },
    delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <FiBox size={11} /> },
    cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <FiXCircle size={11} /> },
};

const FILTER_TABS = ["All", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const getMediaUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}/media/${path}`;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["confirmed"];
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const OrderSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/5" />
                <div className="h-3 bg-gray-100 rounded w-3/5" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-16 shrink-0" />
        </div>
    </div>
);

// ─── Cancel Button ────────────────────────────────────────────────────────────
const CancelButton = ({ orderId, orderNumber, onCancelled }: {
    orderId: number;
    orderNumber: string;
    onCancelled?: () => void;
}) => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const cancel = async () => {
        if (!confirm(`Cancel order #${orderNumber}?`)) return;
        setLoading(true); setErr(null);
        try {
            const token = localStorage.getItem("sxiAccessToken");
            const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to cancel order.");
            setDone(true);
            onCancelled?.();
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Error cancelling order.");
        } finally {
            setLoading(false);
        }
    };

    if (done) return <p className="text-xs text-red-500 font-semibold">Cancellation requested.</p>;

    return (
        <div>
            <button
                onClick={cancel}
                disabled={loading}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg"
            >
                {loading ? "Cancelling…" : "Cancel Order"}
            </button>
            {err && <p className="text-[10px] text-red-400 mt-1">{err}</p>}
        </div>
    );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, expanded, onToggle, onRefetch }: {
    order: Order;
    expanded: boolean;
    onToggle: () => void;
    onRefetch: () => void;
}) => {
    const firstImg = order.items[0]?.product_img;
    const extraCount = order.items.length - 1;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
            {/* Header */}
            <button onClick={onToggle} className="w-full flex items-center gap-4 px-5 py-4 text-left">
                {/* Thumbnails */}
                <div className="flex items-center shrink-0">
                    <img
                        src={getMediaUrl(firstImg)}
                        alt={order.items[0]?.product_name}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-100"
                    />
                    {extraCount > 0 && (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-xs font-black text-gray-500 -ml-3 z-10">
                            +{extraCount}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-black text-black">#{order.order_number}</p>
                        <StatusBadge status={order.status} />
                        {order.payment_status === "paid" && (
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                Paid
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400">
                        {formatDate(order.created_at)} · {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        {" · "}{order.shipping_city}, {order.shipping_country}
                    </p>
                </div>

                {/* Total + chevron */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-black text-black">${parseFloat(order.total_amount).toFixed(2)}</span>
                    <FiChevronRight
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
                    />
                </div>
            </button>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    {/* Items */}
                    <div className="space-y-3 mb-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <img
                                    src={getMediaUrl(item.product_img)}
                                    alt={item.product_name}
                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-800 truncate">{item.product_name}</p>
                                    <p className="text-[10px] text-gray-400">
                                        {[item.color, item.size && `Size: ${item.size}`].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-black text-black">${parseFloat(item.subtotal).toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5 text-xs mb-4">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span className="font-semibold text-gray-800">${parseFloat(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Shipping ({order.shipping_method})</span>
                            <span className={`font-semibold ${parseFloat(order.shipping_fee) === 0 ? "text-green-600" : "text-gray-800"}`}>
                                {parseFloat(order.shipping_fee) === 0 ? "Free" : `$${parseFloat(order.shipping_fee).toFixed(2)}`}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-1.5">
                            <span className="font-black text-black">Total</span>
                            <span className="font-black text-black">${parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>

                    {(order.status === "confirmed" || order.status === "processing") && (
                        <CancelButton orderId={order.id} orderNumber={order.order_number} onCancelled={onRefetch} />
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Orders = () => {
    const [activeFilter, setActiveFilter] = useState("All");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const { orders: fetchedOrders, isLoading, isError, refetch } = useGetOrders();
    const allOrders: Order[] = fetchedOrders?.data ?? [];

    const orders = activeFilter === "All"
        ? allOrders
        : allOrders.filter((o) => o.status.toLowerCase() === activeFilter.toLowerCase());

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
                    <Link to="/" className="hover:text-black transition-colors font-medium">Home</Link>
                    <FiChevronRight size={13} />
                    <span className="font-bold text-gray-800">Order History</span>
                </nav>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-base font-black text-black">Your Orders</h1>
                    {!isLoading && allOrders.length > 0 && (
                        <span className="text-xs text-gray-400 font-semibold bg-white border border-gray-100 px-3 py-1.5 rounded-full">
                            {allOrders.length} order{allOrders.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: "none" }}>
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveFilter(tab); setExpandedId(null); }}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[10px] font-bold border transition-all duration-150 ${activeFilter === tab
                                ? "bg-black border-black text-white"
                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <OrderSkeleton key={i} />)}
                    </div>
                )}

                {/* Error */}
                {!isLoading && isError && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
                        <p className="text-sm text-red-500 font-semibold mb-3">Failed to load your orders.</p>
                        <button
                            onClick={() => refetch?.()}
                            className="text-xs font-black text-white bg-black hover:bg-red-600 px-4 py-2 rounded-xl transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !isError && orders.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-center px-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <HiOutlineShoppingBag size={30} className="text-gray-300" />
                        </div>
                        <h2 className="text-base font-black text-gray-800 mb-1">No orders yet</h2>
                        <p className="text-sm text-gray-400 mb-6 max-w-xs">
                            {activeFilter !== "All"
                                ? `You have no ${activeFilter.toLowerCase()} orders.`
                                : "You haven't placed any orders. Start shopping!"}
                        </p>
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors"
                        >
                            Start Shopping <FiArrowRight size={13} />
                        </Link>
                    </div>
                )}

                {/* Orders list */}
                {!isLoading && !isError && orders.length > 0 && (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                expanded={expandedId === order.id}
                                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                onRefetch={() => refetch?.()}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Orders;