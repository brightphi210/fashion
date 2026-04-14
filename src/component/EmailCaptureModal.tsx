import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import promoImg from "../assets/camo.jpg";
import logo from "../assets/six.png"; // ← adjust filename if needed
import { useNewsletterSubscribe } from "../hooks/mutations/allMutation";

const STORAGE_KEY = "sxi_email_popup_dismissed";

const EmailCaptureModal = () => {
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const { mutate: subscribe, isPending } = useNewsletterSubscribe();

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    const handleSubmit = () => {
        if (!name.trim()) { setError("Please enter your name."); return; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setError("");
        subscribe({ name: name.trim(), email } as any, {
            onSuccess: () => {
                setSubmitted(true);
                localStorage.setItem(STORAGE_KEY, "true");
                setTimeout(() => setVisible(false), 2800);
            },
            onError: () => {
                localStorage.setItem(STORAGE_KEY, "true");
                setSubmitted(true);
                setTimeout(() => setVisible(false), 2800);
            },
        });
    };

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        >
            <div
                className="relative w-full max-w-sm overflow-hidden"
                style={{
                    background: "#0f0f0b",
                    border: "0.5px solid rgba(201,185,154,0.2)",
                    animation: "fadeSlideUp 0.4s cubic-bezier(0.34,1.4,0.64,1)",
                }}
            >
                {/* Close button */}
                <button
                    onClick={dismiss}
                    className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm text-[#c9b99a]/70 hover:text-[#c9b99a]/55 transition-colors"
                    aria-label="Close"
                >
                    <FiX size={16} />
                </button>

                {/* Hero image */}
                <div className="relative w-full h-20" style={{ aspectRatio: "4/3" }}>
                    <img
                        src={promoImg}
                        alt="Join the family"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0b] via-[#0f0f0b]/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="px-6 pb-7 -mt-2">
                    {!submitted ? (
                        <>
                            {/* Logo */}
                            <div className="flex justify-center mb-4">
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="h-20 w-20object-contain"
                                // style={{ filter: "brightness(0) saturate(100%) invert(80%) sepia(20%) saturate(300%) hue-rotate(5deg) brightness(95%)" }}
                                />
                            </div>

                            {/* Headline */}
                            <div className="text-center mb-5">
                                <h2 className="text-xl font-black text-[#c9b99a]/55 tracking-widest uppercase leading-tight mb-1">
                                    10% Off Your<br />First Order
                                </h2>
                                <p className="text-xs text-[#c9b99a]/50 tracking-wide">
                                    By registering, you agree to receive emails, New drops and discounts.
                                </p>
                            </div>

                            {/* Fields */}
                            <div className="flex flex-col gap-2.5 mb-3">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(""); }}
                                    onKeyDown={(e) => e.key === "Enter" && inputRef.current?.focus()}
                                    placeholder="Name"
                                    className="w-full bg-transparent border border-[rgba(201,185,154,0.2)] px-4 py-3 text-sm text-[#c9b99a]/55 placeholder:text-[rgba(201,185,154,0.3)] outline-none focus:border-[rgba(201,185,154,0.6)] transition-colors tracking-wide"
                                    autoFocus
                                />
                                <input
                                    ref={inputRef}
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                    placeholder="Email"
                                    className="w-full bg-transparent border border-[rgba(201,185,154,0.2)] px-4 py-3 text-sm text-[#c9b99a]/55 placeholder:text-[rgba(201,185,154,0.3)] outline-none focus:border-[rgba(201,185,154,0.6)] transition-colors tracking-wide"
                                />
                                {error && (
                                    <p className="text-[11px] text-red-400 -mt-1 tracking-wide">{error}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={isPending}
                                className="w-full py-3.5 bg-[#c9b99a] text-[#0f0f0b] text-xs font-black tracking-widest uppercase hover:bg-[#e0d2b6] disabled:opacity-60 transition-colors mb-3"
                            >
                                {isPending ? "Joining…" : "Join the Family"}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="flex justify-center mb-4">
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="h-10 w-auto object-contain"
                                />
                            </div>
                            <p className="text-3xl mb-3">☠</p>
                            <h3 className="text-base font-black text-[#c9b99a]/55 tracking-widest uppercase mb-1">
                                You're in!
                            </h3>
                            <p className="text-xs text-[rgba(201,185,154,0.5)] tracking-wide">
                                Check your inbox for your exclusive offer.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    );
};

export default EmailCaptureModal;