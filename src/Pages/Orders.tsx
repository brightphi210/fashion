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
import camo from "../assets/camo.jpg";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useGetOrders } from "../hooks/mutations/allMutation";


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

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.6ixunit.store";

const STATUS_CONFIG: Record<string, { label: string; textColor: string; bg: string; icon: React.ReactNode }> = {
    confirmed: { label: "Confirmed", textColor: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: <FiPackage size={11} /> },
    processing: { label: "Processing", textColor: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: <FiRefreshCw size={11} /> },
    shipped: { label: "Shipped", textColor: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", icon: <FiTruck size={11} /> },
    delivered: { label: "Delivered", textColor: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: <FiBox size={11} /> },
    cancelled: { label: "Cancelled", textColor: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: <FiXCircle size={11} /> },
};

const FILTER_TABS = ["All", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const getMediaUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}/media/${path}`;
};

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["confirmed"];
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.textColor}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

const OrderSkeleton = () => (
    <div className="border border-[#c9b99a]/12 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#c9b99a]/8 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
                <div className="h-3 bg-[#c9b99a]/8 rounded w-2/5" />
                <div className="h-3 bg-[#c9b99a]/6 rounded w-3/5" />
            </div>
            <div className="h-4 bg-[#c9b99a]/8 rounded w-14 shrink-0" />
        </div>
    </div>
);

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

    if (done) return <p className="text-xs text-red-400 font-semibold tracking-wide">Cancellation requested.</p>;

    return (
        <div>
            <button
                onClick={cancel}
                disabled={loading}
                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 border border-red-500/20 bg-red-500/8 px-3 py-1.5 rounded-md tracking-wide cursor-pointer"
            >
                {loading ? "Cancelling…" : "Cancel Order"}
            </button>
            {err && <p className="text-[10px] text-red-400 mt-1">{err}</p>}
        </div>
    );
};

const OrderCard = ({ order, expanded, onToggle, onRefetch }: {
    order: Order;
    expanded: boolean;
    onToggle: () => void;
    onRefetch: () => void;
}) => {
    const firstImg = order.items[0]?.product_img;
    const extraCount = order.items.length - 1;

    return (
        <div className="border border-[#c9b99a]/12 rounded-xl overflow-hidden hover:border-[#c9b99a]/25 transition-colors">
            {/* Header row */}
            <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer min-w-0">

                {/* Thumbnails */}
                <div className="flex items-center shrink-0">
                    <img
                        src={getMediaUrl(firstImg)}
                        alt={order.items[0]?.product_name}
                        className="w-10 h-10 rounded-lg object-cover bg-black/40 border border-[#c9b99a]/12"
                    />
                    {extraCount > 0 && (
                        <div className="w-10 h-10 rounded-lg bg-[#c9b99a]/8 border border-[#c9b99a]/12 flex items-center justify-center text-[10px] font-black text-[#c9b99a]/55 -ml-2.5 z-10">
                            +{extraCount}
                        </div>
                    )}
                </div>

                {/* Info — flex-1 with min-w-0 to prevent overflow */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="text-xs font-black text-[#c9b99a] tracking-wide uppercase truncate">#{order.order_number}</p>
                        <StatusBadge status={order.status} />
                        {order.payment_status === "paid" && (
                            <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                                Paid
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-[#c9b99a]/40 truncate">
                        {formatDate(order.created_at)} · {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        {" · "}{order.shipping_city}, {order.shipping_country}
                    </p>
                </div>

                {/* Amount + chevron */}
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span className="text-sm font-black text-white">€{parseFloat(order.total_amount).toFixed(2)}</span>
                    <FiChevronRight
                        size={13}
                        className={`text-[#c9b99a]/40 transition-transform duration-200 shrink-0 ${expanded ? "rotate-90" : ""}`}
                    />
                </div>
            </button>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-[#c9b99a]/8 px-4 pb-4 pt-4">
                    <div className="space-y-3 mb-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 min-w-0">
                                <img
                                    src={getMediaUrl(item.product_img)}
                                    alt={item.product_name}
                                    className="w-9 h-9 rounded-lg object-cover bg-black/40 border border-[#c9b99a]/12 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#c9b99a] truncate uppercase tracking-wide">{item.product_name}</p>
                                    <p className="text-[10px] text-[#c9b99a]/40 truncate">
                                        {[item.color, item.size && `Size: ${item.size}`].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-black text-white">€{parseFloat(item.subtotal).toFixed(2)}</p>
                                    <p className="text-[10px] text-[#c9b99a]/40">×{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-[#c9b99a]/4 border border-[#c9b99a]/10 rounded-xl p-3 space-y-1.5 text-xs mb-4">
                        <div className="flex justify-between text-[#c9b99a]/55">
                            <span>Subtotal</span>
                            <span className="font-semibold text-[#c9b99a]">€{parseFloat(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[#c9b99a]/55">
                            <span className="truncate mr-2">Shipping ({order.shipping_method})</span>
                            <span className={`font-semibold shrink-0 ${parseFloat(order.shipping_fee) === 0 ? "text-green-400" : "text-[#c9b99a]"}`}>
                                {parseFloat(order.shipping_fee) === 0 ? "Free" : `€${parseFloat(order.shipping_fee).toFixed(2)}`}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-[#c9b99a]/12 pt-1.5">
                            <span className="font-black text-[#c9b99a] uppercase tracking-widest">Total</span>
                            <span className="font-black text-white">€{parseFloat(order.total_amount).toFixed(2)}</span>
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

const Orders = () => {
    const [activeFilter, setActiveFilter] = useState("All");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const { orders: fetchedOrders, isLoading, isError, refetch } = useGetOrders();
    const allOrders: Order[] = fetchedOrders?.data ?? [];

    const orders = activeFilter === "All"
        ? allOrders
        : allOrders.filter((o) => o.status.toLowerCase() === activeFilter.toLowerCase());

    return (
        <div
            className="min-h-screen relative"
            style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
        >
            <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className="max-w-5xl mx-auto w-full px-4 py-8 flex-1 min-w-0">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-[#c9b99a]/40 mb-6">
                        <Link to="/" className="hover:text-[#c9b99a] transition-colors font-medium">Home</Link>
                        <FiChevronRight size={12} />
                        <span className="font-bold text-[#c9b99a]">Order History</span>
                    </nav>

                    {/* Title row */}
                    <div className="flex items-center justify-between mb-5 gap-3 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-[3px] h-5 bg-[#c9b99a] rounded-sm shrink-0" />
                            <h1 className="text-sm font-black text-[#c9b99a] tracking-widest uppercase truncate">Your Orders</h1>
                        </div>
                        {!isLoading && allOrders.length > 0 && (
                            <span className="text-[10px] text-[#c9b99a]/55 font-semibold border border-[#c9b99a]/15 px-2.5 py-1 rounded-full tracking-wide shrink-0">
                                {allOrders.length} order{allOrders.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {/* Filter tabs — horizontal scroll, no wrapping */}
                    <div
                        className="flex gap-2 mb-5 -mx-4 px-4"
                        style={{ overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
                    >
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveFilter(tab); setExpandedId(null); }}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border tracking-widest uppercase transition-all duration-150 cursor-pointer ${activeFilter === tab
                                    ? "bg-[#c9b99a] border-[#c9b99a] text-black"
                                    : "border-[#c9b99a]/15 text-[#c9b99a]/40 hover:border-[#c9b99a]/40 hover:text-[#c9b99a]"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => <OrderSkeleton key={i} />)}
                        </div>
                    )}

                    {/* Error */}
                    {!isLoading && isError && (
                        <div className="border border-[#c9b99a]/12 rounded-xl p-6 text-center">
                            <p className="text-sm text-red-400 font-semibold mb-3">Failed to load your orders.</p>
                            <button
                                onClick={() => refetch?.()}
                                className="text-xs font-black text-black bg-[#c9b99a] hover:bg-[#e0d2b6] px-4 py-2 rounded-md tracking-widest uppercase transition-colors cursor-pointer"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && !isError && orders.length === 0 && (
                        <div className="border border-[#c9b99a]/12 rounded-xl flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-[#c9b99a]/6 border border-[#c9b99a]/12 flex items-center justify-center mb-4">
                                <HiOutlineShoppingBag size={24} className="text-[#c9b99a]/30" />
                            </div>
                            <h2 className="text-sm font-black text-[#c9b99a] tracking-widest uppercase mb-1">No orders yet</h2>
                            <p className="text-xs text-[#c9b99a]/45 mb-5 max-w-xs">
                                {activeFilter !== "All"
                                    ? `You have no ${activeFilter.toLowerCase()} orders.`
                                    : "You haven't placed any orders. Start shopping!"}
                            </p>
                            <Link
                                to="/"
                                className="flex items-center gap-1.5 bg-[#c9b99a] hover:bg-[#e0d2b6] text-black font-black px-5 py-2.5 rounded-md text-xs tracking-widest uppercase transition-colors"
                            >
                                Start Shopping <FiArrowRight size={12} />
                            </Link>
                        </div>
                    )}

                    {/* Orders list */}
                    {!isLoading && !isError && orders.length > 0 && (
                        <div className="space-y-2">
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
        </div>
    );
};

export default Orders;