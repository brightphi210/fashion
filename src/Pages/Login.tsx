import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../component/Footer";
import LoadingOverlay from "../component/LoadingOverlay";
import Navbar from "../component/Navbar";
import { useLogin, useRegistration } from "../hooks/mutations/auth";

interface LoginFormData {
    email: string;
    password: string;
}

interface RegisterFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    confirm_password: string;
}

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [rememberMe, setRememberMe] = useState(false);

    const { mutate: loginMutate, isPending: isLoginPending } = useLogin();
    const { mutate: registerMutate, isPending: isRegisterPending } = useRegistration();

    const navigate = useNavigate();

    const loginForm = useForm<LoginFormData>({
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<RegisterFormData>({
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            password: "",
            confirm_password: "",
        },
    });

    // ── LOGIN ──────────────────────────────────────────────────────────────────
    const onLoginSubmit = (data: LoginFormData) => {
        loginMutate(data, {
            onSuccess: (response: any) => {
                // post_requests returns full axios response → actual data is in response.data
                const res = response.data;

                localStorage.setItem("sxiAccessToken", res.access);
                localStorage.setItem("sixRefreshToken", res.refresh);
                localStorage.setItem("user", JSON.stringify(res.user));

                if (rememberMe) {
                    localStorage.setItem("rememberMe", "true");
                    localStorage.setItem("savedEmail", data.email);
                }

                toast.success("Login successful!");
                loginForm.reset();
                setTimeout(() => navigate("/admin/overview"), 1200);
            },
            onError: (error: any) => {
                const err = error?.response?.data;

                // Backend returns 403 with { email_verified: false, email } for unverified accounts
                if (err?.email_verified === false) {
                    toast.warning("Please verify your email first.");
                    setTimeout(() => {
                        navigate("/verify-otp", { state: { email: err.email } });
                    }, 1200);
                    return;
                }

                if (err?.email) return toast.error(Array.isArray(err.email) ? err.email[0] : err.email);
                if (err?.password) return toast.error(Array.isArray(err.password) ? err.password[0] : err.password);
                if (err?.non_field_errors) return toast.error(err.non_field_errors[0]);
                if (err?.error) return toast.error(err.error);
                toast.error("Something went wrong. Please try again.");
            },
        });
    };

    // ── REGISTER ───────────────────────────────────────────────────────────────
    const onRegisterSubmit = (data: RegisterFormData) => {
        registerMutate(data, {
            onSuccess: (response: any) => {
                const res = response.data;
                toast.success("Registration successful! Check your email for the verification code.");
                registerForm.reset();
                navigate("/verify-otp", { state: { email: res.email } });
            },
            onError: (error: any) => {
                const err = error?.response?.data;
                if (!err) return toast.error("Something went wrong. Please try again.");

                if (err?.email) return toast.error(Array.isArray(err.email) ? err.email[0] : err.email);
                if (err?.first_name) return toast.error(Array.isArray(err.first_name) ? err.first_name[0] : err.first_name);
                if (err?.last_name) return toast.error(Array.isArray(err.last_name) ? err.last_name[0] : err.last_name);
                if (err?.phone_number) return toast.error(Array.isArray(err.phone_number) ? err.phone_number[0] : err.phone_number);
                if (err?.password) return toast.error(Array.isArray(err.password) ? err.password[0] : err.password);
                if (err?.confirm_password) return toast.error(Array.isArray(err.confirm_password) ? err.confirm_password[0] : err.confirm_password);
                if (err?.non_field_errors) return toast.error(err.non_field_errors[0]);
                if (err?.error) return toast.error(err.error);
                toast.error("Registration failed. Please try again.");
            },
        });
    };

    const handleToggle = (toLogin: boolean) => {
        setIsLogin(toLogin);
        loginForm.reset();
        registerForm.reset();
        setShowPassword(false);
    };

    const isPending = isLogin ? isLoginPending : isRegisterPending;

    return (
        <>
            <Navbar />
            <ToastContainer />
            <LoadingOverlay visible={isPending} />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
                <div
                    className="w-full max-w-5xl bg-white rounded-3xl shadow-none border border-neutral-100 overflow-hidden flex"
                    style={{ minHeight: "580px" }}
                >
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
                        <div className="absolute bottom-14 left-8 z-10">
                            <span className="text-white text-2xl font-black tracking-tight">6ix</span>
                            <p className="text-white/60 text-sm mt-1">Style. Quality. You.</p>
                        </div>
                    </div>

                    {/* ── Right Panel ── */}
                    <div className="flex-1 flex flex-col justify-center p-10 py-8 overflow-y-auto">
                        <h2 className="text-2xl font-black text-red-600 mb-1 text-center">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="text-center text-gray-400 text-sm mb-5">
                            {isLogin ? "Sign in to continue shopping" : "Join 6ix today"}
                        </p>

                        {/* ── LOGIN FORM ── */}
                        {isLogin && (
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                <Controller name="email" control={loginForm.control}
                                    rules={{
                                        required: "Email is required",
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input {...field} type="email" placeholder="Enter your email" autoCapitalize="none"
                                                    disabled={isPending}
                                                    className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                        ${error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                            </div>
                                            {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller name="password" control={loginForm.control}
                                    rules={{ required: "Password is required" }}
                                    render={({ field, fieldState: { error } }) => (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Password <span className="text-red-500">*</span>
                                                </label>
                                                <Link to="/forgot-password" className="text-xs text-red-500 font-semibold hover:underline">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input {...field} type={showPassword ? "text" : "password"} placeholder="Enter your password"
                                                    disabled={isPending}
                                                    className={`w-full pl-9 pr-10 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                        ${error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                                <button type="button" onClick={() => setShowPassword((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                                </button>
                                            </div>
                                            {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                        </div>
                                    )}
                                />

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={isPending} className="w-4 h-4 rounded border-gray-300 accent-red-600" />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>

                                <button type="submit" disabled={isPending}
                                    className="w-full bg-black hover:bg-red-600 disabled:opacity-60 text-white font-black py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]">
                                    Sign In
                                </button>

                                <p className="text-center text-sm text-gray-500">
                                    Don't have an account?{" "}
                                    <button type="button" onClick={() => handleToggle(false)} className="text-red-600 font-black hover:underline">
                                        Sign Up
                                    </button>
                                </p>
                            </form>
                        )}

                        {/* ── REGISTER FORM ── */}
                        {!isLogin && (
                            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Controller name="first_name" control={registerForm.control}
                                        rules={{ required: "First name is required", minLength: { value: 2, message: "At least 2 characters" } }}
                                        render={({ field, fieldState: { error } }) => (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input {...field} type="text" placeholder="John" disabled={isPending}
                                                        className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                            ${error ? "border-red-400" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                                </div>
                                                {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                            </div>
                                        )}
                                    />
                                    <Controller name="last_name" control={registerForm.control}
                                        rules={{ required: "Last name is required", minLength: { value: 2, message: "At least 2 characters" } }}
                                        render={({ field, fieldState: { error } }) => (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input {...field} type="text" placeholder="Doe" disabled={isPending}
                                                        className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                            ${error ? "border-red-400" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                                </div>
                                                {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                            </div>
                                        )}
                                    />
                                </div>

                                <Controller name="email" control={registerForm.control}
                                    rules={{
                                        required: "Email is required",
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input {...field} type="email" placeholder="john@example.com" autoCapitalize="none"
                                                    disabled={isPending}
                                                    className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                        ${error ? "border-red-400" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                            </div>
                                            {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller name="phone_number" control={registerForm.control}
                                    rules={{
                                        required: "Phone number is required",
                                        pattern: { value: /^\+?[0-9\s\-().]{7,20}$/, message: "Enter a valid phone number" },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input {...field} type="tel" placeholder="+1 234 567 890" disabled={isPending}
                                                    className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                        ${error ? "border-red-400" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                            </div>
                                            {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller name="password" control={registerForm.control}
                                    rules={{ required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } }}
                                    render={({ field, fieldState: { error } }) => (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input {...field} type={showPassword ? "text" : "password"} placeholder="Enter your password"
                                                    disabled={isPending}
                                                    className={`w-full pl-9 pr-10 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                        ${error ? "border-red-400" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                                <button type="button" onClick={() => setShowPassword((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                                </button>
                                            </div>
                                            {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller name="confirm_password" control={registerForm.control}
                                    rules={{
                                        required: "Please confirm your password",
                                        validate: (value) => value === registerForm.getValues("password") || "Passwords do not match",
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Confirm Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input {...field} type={showPassword ? "text" : "password"} placeholder="Confirm your password"
                                                    disabled={isPending}
                                                    className={`w-full pl-9 pr-10 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                        ${error ? "border-red-400" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                                <button type="button" onClick={() => setShowPassword((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                                </button>
                                            </div>
                                            {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                        </div>
                                    )}
                                />

                                <button type="submit" disabled={isPending}
                                    className="w-full bg-black hover:bg-red-600 disabled:opacity-60 text-white font-black py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]">
                                    Sign Up
                                </button>

                                <p className="text-center text-sm text-gray-500">
                                    Already have an account?{" "}
                                    <button type="button" onClick={() => handleToggle(true)} className="text-red-600 font-black hover:underline">
                                        Sign In
                                    </button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;