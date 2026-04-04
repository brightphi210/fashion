import { useEffect, useState } from "react";
import { useNewsletterSubscribe } from "../hooks/mutations/allMutation";

const STORAGE_KEY = "sxi_email_popup_dismissed";

const EmailCaptureModal = () => {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const { mutate: subscribe, isPending } = useNewsletterSubscribe();

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
            // Small delay so it feels natural, not instant
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    const handleSubmit = () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setError("");
        subscribe(email, {
            onSuccess: () => {
                setSubmitted(true);
                localStorage.setItem(STORAGE_KEY, "true");
                setTimeout(() => setVisible(false), 2500);
            },
            onError: () => {
                // Still mark as dismissed so we don't keep bugging them
                localStorage.setItem(STORAGE_KEY, "true");
                setSubmitted(true);
                setTimeout(() => setVisible(false), 2500);
            },
        });
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}>
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                style={{ animation: "fadeSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
            >
                {/* Close button */}
                <button
                    onClick={dismiss}
                    className="absolute top-3.5 right-3.5 text-gray-400 hover:text-black transition-colors z-10"
                    aria-label="Close"
                >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Top accent */}
                <div className="h-1.5 bg-black w-full" />

                <div className="px-7 py-8">
                    {!submitted ? (
                        <>
                            <div className="mb-5 text-center">
                                <span className="text-3xl">🎁</span>
                                <h2
                                    className="text-xl font-extrabold text-black mt-2 leading-tight"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    Get Exclusive Offers
                                </h2>
                                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                                    Join our list and be the first to know about sales, new drops, and bonus deals.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                    placeholder="your@email.com"
                                    className="w-full border-[1.5px] border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 outline-none focus:border-black transition-colors"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-red-500 text-xs -mt-1">{error}</p>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    className="w-full bg-black text-white rounded-xl py-3 text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-60"
                                >
                                    {isPending ? "Subscribing..." : "Get My Offers →"}
                                </button>
                            </div>

                            <p className="text-center text-[11px] text-gray-400 mt-3">
                                No spam. Unsubscribe anytime.
                            </p>

                            <button
                                onClick={dismiss}
                                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
                            >
                                No thanks
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <span className="text-4xl">🎉</span>
                            <h3
                                className="text-lg font-extrabold text-black mt-3"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                You're in!
                            </h3>
                            <p className="text-gray-500 text-sm mt-1.5">
                                Watch your inbox for exclusive offers.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    );
};

export default EmailCaptureModal;