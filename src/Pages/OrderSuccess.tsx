import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiCheck, FiClock, FiPackage, FiXCircle } from "react-icons/fi";
import { HiOutlineTruck } from "react-icons/hi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import camo from "../assets/camo.jpg";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useShop } from "../providers/ShopContext";

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

    const sessionId = searchParams.get("session_id");

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<OrderData | null>(null);
    const [paid, setPaid] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollAttemptsRef = useRef(0);
    const cartClearedRef = useRef(false);

    useEffect(() => {
        if (!sessionId) { navigate("/"); return; }
        const accessToken = localStorage.getItem("sxiAccessToken");
        if (!accessToken) { navigate("/login", { state: { from: `/order-success?session_id=${sessionId}` } }); return; }

        const verify = async (): Promise<boolean> => {
            try {
                const res = await fetch(
                    `https://api.6ixunit.store/api/payments/verify-session/?session_id=${sessionId}`,
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

    const bgStyle = {
        backgroundImage: `url('${camo}')`,
        backgroundRepeat: "repeat" as const,
        backgroundSize: "100%",
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen relative" style={bgStyle}>
                <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />
                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <span className="w-10 h-10 border-2 border-[#c9b99a]/30 border-t-[#c9b99a] rounded-full animate-spin inline-block" />
                            <p className="text-sm font-semibold text-[#c9b99a]/55 tracking-wide">Verifying your payment…</p>
                            <p className="text-xs text-[#c9b99a]/30">This only takes a moment.</p>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    // ── Error / Not Paid ──────────────────────────────────────────────────────
    if (error || !paid) {
        return (
            <div className="min-h-screen relative" style={bgStyle}>
                <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />
                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center px-4">
                        <div className="border border-[#c9b99a]/15 rounded-2xl w-full max-w-sm text-center p-8 bg-[#100e0a]/80">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <FiXCircle size={30} className="text-red-400" />
                            </div>
                            <h1 className="text-base font-black text-[#c9b99a] tracking-widest uppercase mb-2">Payment Not Confirmed</h1>
                            <p className="text-sm text-[#c9b99a]/45 mb-6">
                                {error ?? "We couldn't confirm your payment yet. If you were charged, please contact support with your order reference."}
                            </p>
                            {order?.order_number && (
                                <p className="text-xs mb-4 rounded-md px-3 py-2 border border-[#c9b99a]/10 text-[#c9b99a]/40">
                                    Order reference: <span className="font-black text-[#c9b99a]">{order.order_number}</span>
                                </p>
                            )}
                            <div className="space-y-2">
                                <Link
                                    to="/cart"
                                    className="w-full font-black py-3 rounded-md text-xs tracking-widest uppercase flex items-center justify-center gap-2 bg-[#c9b99a] text-black hover:bg-[#e0d2b6] transition-colors"
                                >
                                    Return to Cart
                                </Link>
                                <Link
                                    to="/orders"
                                    className="w-full font-bold py-3 rounded-md text-xs tracking-widest uppercase flex items-center justify-center border border-[#c9b99a]/15 text-[#c9b99a]/55 hover:text-[#c9b99a] hover:border-[#c9b99a]/35 transition-colors"
                                >
                                    Check Order History
                                </Link>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen relative" style={bgStyle}>
            <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">

                        {/* Hero card */}
                        <div className="rounded-2xl p-8 text-center mb-5 relative overflow-hidden border border-[#c9b99a]/15 bg-[#0a0a08]">
                            {/* Camo-style decorative rings */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 rounded-full border border-[#c9b99a]/5" />
                                <div className="absolute w-48 h-48 rounded-full border border-[#c9b99a]/8" />
                            </div>
                            <div className="w-20 h-20 rounded-full bg-[#c9b99a] flex items-center justify-center mx-auto mb-5 relative z-10">
                                <FiCheck size={34} className="text-black" strokeWidth={3} />
                            </div>
                            <h1 className="text-[#c9b99a] font-black text-xl tracking-widest uppercase relative z-10">Order Confirmed!</h1>
                            <p className="text-[#c9b99a]/45 text-sm mt-2 relative z-10">
                                Your payment was successful and your order is being processed.
                            </p>
                        </div>

                        {/* Order details */}
                        <div className="border border-[#c9b99a]/12 rounded-2xl p-5 mb-4">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-[3px] h-4 bg-[#c9b99a] rounded-sm" />
                                <h2 className="font-black text-sm text-[#c9b99a] tracking-widest uppercase">Order Details</h2>
                            </div>
                            <div className="space-y-0">
                                {[
                                    { icon: <FiPackage size={15} />, label: "Order Number", value: order?.order_number ?? "—" },
                                    { icon: <HiOutlineTruck size={16} />, label: "Estimated Delivery", value: deliveryEstimate() },
                                    { icon: <FiClock size={15} />, label: "Status", value: "Processing", badge: true },
                                ].map(({ icon, label, value, badge }) => (
                                    <div key={label} className="flex items-center justify-between py-3 border-b border-[#c9b99a]/8 last:border-0">
                                        <div className="flex items-center gap-2 text-[#c9b99a]/45">
                                            {icon}
                                            <span className="text-xs font-semibold tracking-wide">{label}</span>
                                        </div>
                                        {badge ? (
                                            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#c9b99a]/8 text-[#c9b99a] tracking-wide uppercase">
                                                {value}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-black text-[#c9b99a]">{value}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        {order?.total_amount && (
                            <div className="border border-[#c9b99a]/12 rounded-2xl p-4 mb-4 flex justify-between items-center">
                                <span className="text-sm font-black text-[#c9b99a] uppercase tracking-widest">Total Paid</span>
                                <span className="text-lg font-black text-white">€{parseFloat(order.total_amount).toFixed(2)} EUR</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-2.5">
                            <Link
                                to="/orders"
                                className="w-full font-black py-3.5 rounded-md text-xs tracking-widest uppercase flex items-center justify-center gap-2 bg-[#c9b99a] text-black hover:bg-[#e0d2b6] transition-colors"
                            >
                                <FiPackage size={15} /> View Order History <FiArrowRight size={14} />
                            </Link>
                            <Link
                                to="/"
                                className="w-full font-black py-3.5 rounded-md text-xs tracking-widest uppercase flex items-center justify-center border border-[#c9b99a]/15 text-[#c9b99a]/55 hover:text-[#c9b99a] hover:border-[#c9b99a]/35 transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default OrderSuccess;