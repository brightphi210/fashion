import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiCheck, FiClock, FiPackage, FiXCircle } from "react-icons/fi";
import { HiOutlineTruck } from "react-icons/hi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useShop } from "../providers/ShopContext";
import { useTheme } from "../providers/ThemeContext";

type OrderData = {
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: string;
    shipping_method: string;
    created_at: string;
};

const MAX_POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 3000;

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useShop();
    const { isDark } = useTheme();

    const sessionId = searchParams.get("session_id");

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<OrderData | null>(null);
    const [paid, setPaid] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollAttemptsRef = useRef(0);
    const cartClearedRef = useRef(false);

    // Design tokens
    const bg = "var(--bg-page)";
    const card = isDark ? "var(--bg-card)" : "#ffffff";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
    const divider = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const textPrimary = "var(--text-primary)";
    const textMuted = "var(--text-muted)";

    useEffect(() => {
        if (!sessionId) { navigate("/"); return; }
        const accessToken = localStorage.getItem("sxiAccessToken");
        if (!accessToken) { navigate("/login", { state: { from: `/order-success?session_id=${sessionId}` } }); return; }

        const verify = async (): Promise<boolean> => {
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/api/payments/verify-session/?session_id=${sessionId}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                if (res.status === 401) { localStorage.removeItem("sxiAccessToken"); localStorage.removeItem("user"); navigate("/login"); return true; }
                const contentType = res.headers.get("content-type") ?? "";
                if (!contentType.includes("application/json")) throw new Error(`Server returned non-JSON response (HTTP ${res.status}).`);
                if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData?.detail ?? "Could not verify payment."); }
                const data = await res.json();
                setOrder(data.order);
                setPaid(data.paid);
                if (data.paid) { if (!cartClearedRef.current) { clearCart(); cartClearedRef.current = true; } return true; }
                return false;
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Something went wrong.");
                return true;
            }
        };

        const runVerification = async () => {
            setLoading(true);
            const done = await verify();
            pollAttemptsRef.current += 1;
            if (done || pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) { setLoading(false); return; }
            setTimeout(async () => {
                const doneFinal = await verify();
                pollAttemptsRef.current += 1;
                if (!doneFinal && pollAttemptsRef.current < MAX_POLL_ATTEMPTS) {
                    setTimeout(async () => { await verify(); setLoading(false); }, POLL_INTERVAL_MS * 2);
                } else { setLoading(false); }
            }, POLL_INTERVAL_MS);
        };
        runVerification();
    }, [sessionId]);

    const deliveryEstimate = () => {
        const days = order?.shipping_method === "express" ? 3 : 7;
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    };

    const btnPrimary = {
        backgroundColor: isDark ? "#ffffff" : "#000000",
        color: isDark ? "#000000" : "#ffffff",
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ backgroundColor: bg, minHeight: "100vh" }} className="flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <span
                            className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin inline-block"
                            style={{ borderColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", borderTopColor: "transparent" }}
                        />
                        <p className="text-sm font-semibold" style={{ color: textMuted }}>Verifying your payment…</p>
                        <p className="text-xs" style={{ color: textMuted, opacity: 0.6 }}>This only takes a moment.</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error || !paid) {
        return (
            <div style={{ backgroundColor: bg, minHeight: "100vh" }} className="flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="rounded-3xl border w-full max-w-sm text-center p-8" style={{ backgroundColor: card, borderColor: border }}>
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <FiXCircle size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-lg font-black mb-2" style={{ color: textPrimary }}>Payment Not Confirmed</h1>
                        <p className="text-sm mb-6" style={{ color: textMuted }}>
                            {error ?? "We couldn't confirm your payment yet. If you were charged, please contact support with your order reference."}
                        </p>
                        {order?.order_number && (
                            <p className="text-xs mb-4 rounded-lg px-3 py-2" style={{ color: textMuted, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                                Order reference: <span className="font-black" style={{ color: textPrimary }}>{order.order_number}</span>
                            </p>
                        )}
                        <div className="space-y-2">
                            <Link to="/cart" className="w-full font-black py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                                style={btnPrimary}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#ef4444"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = btnPrimary.backgroundColor; (e.currentTarget as HTMLElement).style.color = btnPrimary.color; }}
                            >
                                Return to Cart
                            </Link>
                            <Link to="/orders" className="w-full font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center"
                                style={{ border: `1px solid ${border}`, color: textMuted }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = textPrimary; (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = textMuted; (e.currentTarget as HTMLElement).style.borderColor = border; }}
                            >
                                Check Order History
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────────────────────────
    return (
        <div style={{ backgroundColor: bg, minHeight: "100vh" }} className="flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Hero card */}
                    <div
                        className="rounded-3xl p-8 text-center mb-5 relative overflow-hidden"
                        style={{ backgroundColor: isDark ? "#0a0a0a" : "#0a0a0a" }}
                    >
                        {/* Decorative rings */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.05)" }} />
                            <div className="absolute w-48 h-48 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
                        </div>
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-5 relative z-10 shadow-xl">
                            <FiCheck size={36} className="text-black" strokeWidth={3} />
                        </div>
                        <h1 className="text-white font-black text-2xl relative z-10">Order Confirmed!</h1>
                        <p className="text-white/60 text-sm mt-2 relative z-10">
                            Your payment was successful and your order is being processed.
                        </p>
                    </div>

                    {/* Order details */}
                    <div className="rounded-2xl border p-5 mb-4" style={{ backgroundColor: card, borderColor: border }}>
                        <h2 className="font-black text-sm mb-4" style={{ color: textPrimary }}>Order Details</h2>
                        <div className="space-y-3">
                            {[
                                { icon: <FiPackage size={15} />, label: "Order Number", value: order?.order_number ?? "—", highlight: true },
                                { icon: <HiOutlineTruck size={16} />, label: "Estimated Delivery", value: deliveryEstimate() },
                                { icon: <FiClock size={15} />, label: "Status", value: "Processing", badge: true },
                            ].map(({ icon, label, value, badge }) => (
                                <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${divider}` }}>
                                    <div className="flex items-center gap-2" style={{ color: textMuted }}>
                                        {icon}
                                        <span className="text-xs font-semibold">{label}</span>
                                    </div>
                                    {badge ? (
                                        <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ color: textPrimary, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }}>
                                            {value}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-black" style={{ color: textPrimary }}>{value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    {order?.total_amount && (
                        <div className="rounded-2xl border p-4 mb-4 flex justify-between items-center" style={{ backgroundColor: card, borderColor: border }}>
                            <span className="text-sm font-black" style={{ color: textPrimary }}>Total Paid</span>
                            <span className="text-lg font-black" style={{ color: textPrimary }}>
                                ${parseFloat(order.total_amount).toFixed(2)} USD
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2.5">
                        <Link
                            to="/orders"
                            className="w-full font-black py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                            style={btnPrimary}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? "#e5e7eb" : "#1f2937"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = btnPrimary.backgroundColor; }}
                        >
                            <FiPackage size={15} /> View Order History <FiArrowRight size={14} />
                        </Link>
                        <Link
                            to="/"
                            className="w-full font-black py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center"
                            style={{ border: `2px solid ${border}`, color: textMuted }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = textPrimary; (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = textMuted; (e.currentTarget as HTMLElement).style.borderColor = border; }}
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default OrderSuccess;