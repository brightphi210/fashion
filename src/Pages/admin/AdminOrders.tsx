import { useState } from "react";
import {
    FiAlertCircle,
    FiCheckCircle, FiChevronDown, FiEye,
    FiMail, FiMapPin, FiPackage, FiPhone,
    FiSearch, FiShoppingBag,
    FiTruck, FiUser, FiX,
} from "react-icons/fi";
import { useGetOrders, useUpdateOrderStatus } from "../../hooks/mutations/allMutation";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// ─── Toast — centered pill style matching home page ───────────────────────────
type Toast = { id: number; message: string; type: "success" | "error" };

const ToastContainer = ({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) => (
    <>
        <style>{`
            @keyframes toastIn {
                from { opacity:0; transform:translateY(14px) scale(0.96); }
                to   { opacity:1; transform:translateY(0)    scale(1);    }
            }
            .toast-pill { animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        `}</style>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none w-max max-w-[90vw]">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className="toast-pill pointer-events-auto flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full text-sm font-semibold text-white"
                    style={{
                        background: t.type === "success" ? "rgba(12,12,12,0.93)" : "rgba(210,40,40,0.93)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.06) inset",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {t.type === "success"
                        ? <FiCheckCircle size={14} className="text-emerald-400 shrink-0" />
                        : <FiAlertCircle size={14} className="text-red-200 shrink-0" />
                    }
                    <span>{t.message}</span>
                    <button
                        onClick={() => remove(t.id)}
                        className="ml-1 w-5 h-5 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-white/15 transition-all shrink-0"
                    >
                        <FiX size={11} />
                    </button>
                </div>
            ))}
        </div>
    </>
);

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, {
    color: string; bg: string; border: string;
    dot: string; icon: React.ReactNode; label: string;
}> = {
    confirmed: {
        color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200",
        dot: "bg-blue-500", icon: <FiCheckCircle size={11} />, label: "Confirmed",
    },
    processing: {
        color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200",
        dot: "bg-violet-500", icon: <FiPackage size={11} />, label: "Processing",
    },
    shipped: {
        color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200",
        dot: "bg-indigo-500", icon: <FiTruck size={11} />, label: "Shipped",
    },
    delivered: {
        color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",
        dot: "bg-emerald-500", icon: <FiCheckCircle size={11} />, label: "Delivered",
    },
};

const PAY_CFG: Record<string, { color: string; bg: string; border: string }> = {
    paid: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    unpaid: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    failed: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    refunded: { color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" },
};

const ALL_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

// ─── Status Dropdown ──────────────────────────────────────────────────────────
const StatusDropdown = ({
    orderId, current, orderNumber, onChange, onToast,
}: {
    orderId: number;
    current: string;
    orderNumber: string;
    onChange?: (s: string) => void;
    onToast: (msg: string, type: "success" | "error") => void;
}) => {
    const [open, setOpen] = useState(false);
    const [local, setLocal] = useState(current);
    const [loading, setLoading] = useState(false);
    const update = useUpdateOrderStatus();
    const cfg = STATUS_CFG[local] ?? STATUS_CFG.confirmed;

    const select = async (s: string) => {
        setOpen(false);
        if (s === local) return;
        const prev = local;
        setLocal(s);
        setLoading(true);
        try {
            await update.mutateAsync({ orderId, status: s });
            onChange?.(s);
            const label = STATUS_CFG[s]?.label ?? s;
            onToast(`#${orderNumber} → ${label} · Email sent to customer`, "success");
        } catch {
            setLocal(prev);
            onToast("Failed to update status. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                disabled={loading}
                className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full border-2 transition-all ${cfg.color} ${cfg.bg} ${cfg.border} hover:shadow-sm disabled:opacity-60`}
            >
                {loading
                    ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                }
                {cfg.label}
                <FiChevronDown size={9} className={`transition-transform ml-0.5 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden min-w-[160px]">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 py-2.5 border-b border-gray-50">
                            Update Status
                        </p>
                        {ALL_STATUSES.map(s => {
                            const c = STATUS_CFG[s];
                            const isActive = s === local;
                            return (
                                <button
                                    key={s}
                                    onClick={() => select(s)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors hover:bg-gray-50 ${isActive ? "bg-gray-50" : ""}`}
                                >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                                    <span className={`font-bold ${c.color}`}>{c.label}</span>
                                    {isActive && (
                                        <span className="ml-auto text-[9px] font-black text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                            Now
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Order Detail Modal ───────────────────────────────────────────────────────
const OrderModal = ({ order, onClose }: { order: any; onClose: () => void }) => {
    const payCfg = PAY_CFG[order.payment_status] ?? PAY_CFG.unpaid;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 rounded-t-3xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details</p>
                            <h2 className="text-xl font-black text-gray-900 mt-0.5">#{order.order_number}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                    year: "numeric", month: "long", day: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${payCfg.color} ${payCfg.bg} ${payCfg.border}`}>
                                {order.payment_status}
                            </span>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Customer</p>
                        <div className="space-y-2.5">
                            {[
                                { icon: <FiUser size={12} />, val: `${order.shipping_first_name} ${order.shipping_last_name}` },
                                { icon: <FiMail size={12} />, val: order.shipping_email },
                                { icon: <FiPhone size={12} />, val: order.shipping_phone },
                                {
                                    icon: <FiMapPin size={12} />,
                                    val: [order.shipping_street_address, order.shipping_city, order.shipping_state, order.shipping_country, order.shipping_postal_code].filter(Boolean).join(", "),
                                },
                            ].map(({ icon, val }, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
                                    <span className="text-xs font-medium text-gray-700 leading-relaxed">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {order.items?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                Items · {order.items.length}
                            </p>
                            <div className="space-y-2">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                                            {item.product_img && (
                                                <img
                                                    src={item.product_img.startsWith("http") ? item.product_img : `${API_BASE}/media/${item.product_img}`}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-800 truncate">{item.product_name}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {[item.color, item.size].filter(Boolean).join(" · ")} &times; {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-gray-900">${parseFloat(item.subtotal).toFixed(2)}</p>
                                            <p className="text-[10px] text-gray-400">${parseFloat(item.unit_price).toFixed(2)} ea.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-900 rounded-2xl p-4 text-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Summary</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="font-bold">${parseFloat(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Shipping ({order.shipping_method})</span>
                                <span className="font-bold">${parseFloat(order.shipping_fee).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-black pt-3 border-t border-gray-700 mt-2">
                                <span>Total</span>
                                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Note</p>
                            <p className="text-xs text-amber-800 leading-relaxed">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({
    order, onView, onToast,
}: {
    order: any;
    onView: () => void;
    onToast: (msg: string, type: "success" | "error") => void;
}) => {
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const payCfg = PAY_CFG[order.payment_status] ?? PAY_CFG.unpaid;
    const statusCfg = STATUS_CFG[currentStatus] ?? STATUS_CFG.confirmed;
    const total = parseFloat(order.total_amount || "0");
    const date = new Date(order.created_at);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
            <div className={`h-1 w-full ${statusCfg.dot}`} />
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm font-black text-gray-900">#{order.order_number}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-gray-900">${total.toFixed(2)}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border capitalize ${payCfg.color} ${payCfg.bg} ${payCfg.border}`}>
                            {order.payment_status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <FiUser size={12} className="text-gray-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">
                            {order.shipping_first_name} {order.shipping_last_name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{order.shipping_city}, {order.shipping_country}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <StatusDropdown
                        orderId={order.id}
                        current={currentStatus}
                        orderNumber={order.order_number}
                        onChange={setCurrentStatus}
                        onToast={onToast}
                    />
                    <button
                        onClick={onView}
                        className="group flex items-center gap-1.5 text-[11px] font-black bg-black text-white px-3.5 py-1.5 rounded-full hover:bg-gray-800 active:scale-95 transition-all duration-150"
                    >
                        <FiEye size={11} className="group-hover:scale-110 transition-transform" />
                        View Order
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminOrders = () => {
    const { orders, isLoading } = useGetOrders();
    const allOrders: any[] = Array.isArray(orders?.data) ? orders.data : [];

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: "success" | "error" = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const filtered = allOrders.filter(o => {
        const matchSearch =
            o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
            `${o.shipping_first_name} ${o.shipping_last_name}`.toLowerCase().includes(search.toLowerCase()) ||
            o.shipping_email?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const counts = ALL_STATUSES.reduce(
        (acc, s) => ({ ...acc, [s]: allOrders.filter(o => o.status === s).length }),
        {} as Record<string, number>
    );

    const totalRevenue = allOrders
        .filter(o => o.payment_status === "paid")
        .reduce((s, o) => s + parseFloat(o.total_amount || "0"), 0);

    return (
        <div className="p-6 max-w-6xl">
            <ToastContainer toasts={toasts} remove={removeToast} />

            {selectedOrder && (
                <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orders</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    {allOrders.length} total · ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })} revenue
                </p>
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
                <button
                    onClick={() => setFilterStatus("all")}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-full border-2 transition-all ${filterStatus === "all"
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}
                >
                    All <span className="ml-0.5 opacity-60">{allOrders.length}</span>
                </button>
                {ALL_STATUSES.map(s => {
                    const c = STATUS_CFG[s];
                    const active = filterStatus === s;
                    return (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full border-2 transition-all ${active
                                ? `${c.bg} ${c.color} ${c.border}`
                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                            {c.label}
                            <span className="opacity-60">{counts[s]}</span>
                        </button>
                    );
                })}
            </div>

            <div className="relative mb-6">
                <FiSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by order #, name or email…"
                    className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 bg-white"
                />
                {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <FiX size={14} />
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                            <div className="h-1 bg-gray-100 rounded-full mb-4 -mx-5 -mt-5" />
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-4 w-32 bg-gray-100 rounded-full" />
                                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                                </div>
                                <div className="h-8 w-full bg-gray-100 rounded-xl" />
                                <div className="flex justify-between pt-2">
                                    <div className="h-7 w-24 bg-gray-100 rounded-full" />
                                    <div className="h-7 w-20 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-24 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiShoppingBag size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No orders found</p>
                    <p className="text-xs text-gray-300 mt-1">
                        {search ? "Try a different search term" : "Orders will appear here once placed"}
                    </p>
                    {search && (
                        <button onClick={() => setSearch("")} className="mt-3 text-xs font-black text-black underline underline-offset-2">
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onView={() => setSelectedOrder(order)}
                            onToast={addToast}
                        />
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-300 text-center mt-6">
                Showing {filtered.length} of {allOrders.length} orders
            </p>
        </div>
    );
};

export default AdminOrders;