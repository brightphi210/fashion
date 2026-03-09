import { useState } from "react";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  return (
    <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div
                className="w-full max-w-5xl bg-white rounded-3xl shadow-none border border-neutral-100 overflow-hidden flex"
                style={{ minHeight: "580px" }}
            >
                {/* ── Left Panel ── */}
                <div className="hidden md:block w-5/12 relative">
                <div
                    className="absolute inset-0"
                    style={{
                    background: `
                        linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%),
                        url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80') center/cover no-repeat
                    `,
                    }}
                />

                <div
                    className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #ef4444, transparent)" }}
                />
                <div
                    className="absolute bottom-16 right-4 w-32 h-32 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, #ffffff, transparent)" }}
                />

                {/* Carousel dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {[0, 1, 2, 3].map((i) => (
                    <span
                        key={i}
                        className={`block rounded-full transition-all ${
                        i === 0 ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"
                        }`}
                    />
                    ))}
                </div>

                {/* Brand */}
                <div className="absolute bottom-14 left-8 z-10">
                    <span className="text-white text-2xl font-black tracking-tight">StoreOne</span>
                    <p className="text-white/60 text-sm mt-1">Style. Quality. You.</p>
                </div>
                </div>

                {/* ── Right Panel: Form ── */}
                <div className="flex-1 flex flex-col justify-center p-10 py-10">
                <h2 className="text-2xl font-black text-red-600 mb-1 text-center">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-center text-gray-400 text-sm mb-6">
                    {isLogin ? "Sign in to continue shopping" : "Join StoreOne today"}
                </p>

                <div className="space-y-4">
                    {!isLogin && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder-gray-300"
                        />
                        </div>
                    </div>
                    )}

                    {/* Email */}
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder-gray-300"
                        />
                    </div>
                    </div>

                    {/* Password */}
                    <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-semibold text-gray-700">
                        Password <span className="text-red-500">*</span>
                        </label>
                        {isLogin && (
                        <button type="button" className="text-xs text-red-500 font-semibold hover:underline">
                            Forgot password?
                        </button>
                        )}
                    </div>
                    <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder-gray-300"
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                    </div>

                    {/* Submit */}
                    <button
                    type="button"
                    className="w-full bg-black hover:bg-red-600 cursor-pointer text-white font-black py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]"
                    >
                    {isLogin ? "Sign In" : "Sign Up"}
                    </button>
                </div>

                {/* Toggle */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => setIsLogin((v) => !v)}
                        className="text-red-600 cursor-pointer font-black hover:underline"
                    >
                    {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </p>
                </div>
            </div>
        </div>
        <Footer />
    </>
  );
};

export default Login;