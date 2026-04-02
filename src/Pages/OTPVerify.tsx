import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../component/Footer";
import LoadingOverlay from "../component/LoadingOverlay";
import Navbar from "../component/Navbar";
import { useResendOtp, useVerifyOTP } from "../hooks/mutations/auth";

const OTP_LENGTH = 4;

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const email: string = location.state?.email ?? "";

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));

    const { mutate: verifyOtpMutate, isPending: isVerifying } = useVerifyOTP();
    const { mutate: resendOtpMutate, isPending: isResending } = useResendOtp();

    const isPending = isVerifying || isResending;

    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    useEffect(() => { inputRefs.current[0]?.focus(); }, []);

    useEffect(() => {
        if (!email) navigate("/login");
    }, [email, navigate]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (otp[index]) {
                const next = [...otp]; next[index] = ""; setOtp(next);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((char, i) => { next[i] = char; });
        setOtp(next);
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const isComplete = otp.every((d) => d !== "");
    const otpValue = otp.join("");

    const handleSubmit = () => {
        if (!isComplete) { toast.error("Please enter all 4 digits."); return; }

        verifyOtpMutate(
            { email, otp: otpValue },
            {
                onSuccess: (response: any) => {
                    const res = response.data;
                    localStorage.setItem("access_token", res.access);
                    localStorage.setItem("refresh_token", res.refresh);
                    localStorage.setItem("user", JSON.stringify(res.user));
                    toast.success("Email verified successfully!");
                    setTimeout(() => navigate("/login"), 1000);
                },
                onError: (error: any) => {
                    const err = error?.response?.data;
                    if (err?.error) toast.error(err.error);
                    else if (err?.otp) toast.error(Array.isArray(err.otp) ? err.otp[0] : err.otp);
                    else if (err?.non_field_errors) toast.error(err.non_field_errors[0]);
                    else toast.error("Invalid OTP. Please try again.");
                    setOtp(Array(OTP_LENGTH).fill(""));
                    inputRefs.current[0]?.focus();
                },
            }
        );
    };

    const handleResend = () => {
        if (!canResend || isResending) return;
        resendOtpMutate(
            { email },
            {
                onSuccess: () => {
                    toast.info("A new 4-digit code has been sent to your email.");
                    setCanResend(false);
                    setCountdown(60);
                    setOtp(Array(OTP_LENGTH).fill(""));
                    inputRefs.current[0]?.focus();
                },
                onError: (error: any) => {
                    const err = error?.response?.data;
                    toast.error(err?.error || "Failed to resend code. Please try again.");
                },
            }
        );
    };

    return (
        <>
            <Navbar />
            <ToastContainer />
            <LoadingOverlay visible={isPending} />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-none border border-neutral-100 overflow-hidden flex"
                    style={{ minHeight: "580px" }}>

                    {/* ── Left Panel ── */}
                    <div className="hidden md:block w-5/12 relative">
                        <div className="absolute inset-0" style={{
                            background: `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%),
                                url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80') center/cover no-repeat`,
                        }} />
                        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20"
                            style={{ background: "radial-gradient(circle, #ef4444, transparent)" }} />
                        <div className="absolute bottom-16 right-4 w-32 h-32 rounded-full opacity-15"
                            style={{ background: "radial-gradient(circle, #ffffff, transparent)" }} />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {[0, 1, 2, 3].map((i) => (
                                <span key={i} className={`block rounded-full transition-all ${i === 0 ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
                            ))}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-white text-center text-sm leading-relaxed opacity-80">
                                We sent a 4-digit verification code to your email. Enter it to confirm your identity.
                            </p>
                        </div>
                        <div className="absolute bottom-14 left-8 z-10">
                            <span className="text-white text-2xl font-black tracking-tight">6ix</span>
                            <p className="text-white/60 text-sm mt-1">Style. Quality. You.</p>
                        </div>
                    </div>

                    {/* ── Right Panel ── */}
                    <div className="flex-1 flex flex-col justify-center p-10 py-10">
                        <button type="button" onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8 w-fit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>

                        <h2 className="text-2xl font-black text-red-600 mb-1 text-center">Verify Your Email</h2>
                        <p className="text-center text-gray-400 text-sm mb-2">Enter the 4-digit code we sent to</p>
                        <p className="text-center text-gray-700 font-semibold text-sm mb-8 truncate px-4">
                            {email || "your email address"}
                        </p>

                        {/* OTP Inputs */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={isPending}
                                    className={`w-16 h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all duration-200
                                        ${digit ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 bg-gray-50 text-gray-800"}
                                        focus:border-red-500 focus:bg-red-50 focus:ring-4 focus:ring-red-100
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                                />
                            ))}
                        </div>

                        {/* Progress dots */}
                        <div className="flex justify-center gap-2 mb-8">
                            {otp.map((digit, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${digit ? "w-8 bg-red-500" : "w-4 bg-gray-200"}`} />
                            ))}
                        </div>

                        {/* Submit */}
                        <button type="button" onClick={handleSubmit} disabled={isPending || !isComplete}
                            className="w-full bg-black hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]">
                            {isVerifying ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Verifying...
                                </span>
                            ) : "Verify Email"}
                        </button>

                        {/* Resend */}
                        <p className="text-center text-sm text-gray-500 mt-6">
                            Didn't receive the code?{" "}
                            {canResend ? (
                                <button type="button" onClick={handleResend} disabled={isResending}
                                    className="text-red-600 font-black hover:underline disabled:opacity-50">
                                    {isResending ? "Sending..." : "Resend Code"}
                                </button>
                            ) : (
                                <span className="text-gray-400">
                                    Resend in{" "}
                                    <span className="font-black text-gray-600 tabular-nums">
                                        0:{String(countdown).padStart(2, "0")}
                                    </span>
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VerifyOtp;