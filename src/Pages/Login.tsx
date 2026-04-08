import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiMail, FiPhone, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../component/Footer";
import LoadingOverlay from "../component/LoadingOverlay";
import Navbar from "../component/Navbar";
import { useLogin, useRegistration } from "../hooks/mutations/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserLoginFormData {
    email: string;
}

interface RegisterFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
}

interface AdminLoginFormData {
    email: string;
    password: string;
}

// ─── View modes ───────────────────────────────────────────────────────────────
type ViewMode = "login" | "register" | "admin";

const Login = () => {
    const [viewMode, setViewMode] = useState<ViewMode>("login");

    const { mutate: loginMutate, isPending: isLoginPending } = useLogin();
    const { mutate: registerMutate, isPending: isRegisterPending } = useRegistration();

    const navigate = useNavigate();

    const userLoginForm = useForm<UserLoginFormData>({
        defaultValues: { email: "" },
    });

    const registerForm = useForm<RegisterFormData>({
        defaultValues: { first_name: "", last_name: "", email: "", phone_number: "" },
    });

    const adminLoginForm = useForm<AdminLoginFormData>({
        defaultValues: { email: "", password: "" },
    });

    // ── USER LOGIN (email only) ────────────────────────────────────────────────
    const onUserLoginSubmit = (data: UserLoginFormData) => {
        loginMutate(data, {
            onSuccess: (response: any) => {
                const res = response.data;
                localStorage.setItem("sxiAccessToken", res.access);
                localStorage.setItem("sixRefreshToken", res.refresh);
                localStorage.setItem("user", JSON.stringify(res.user));
                toast.success("Welcome back!");
                userLoginForm.reset();
                setTimeout(() => navigate("/checkout"), 1200);
            },
            onError: (error: any) => {
                const err = error?.response?.data;
                if (!err) return toast.error("Something went wrong. Please try again.");
                if (err?.email) return toast.error(Array.isArray(err.email) ? err.email[0] : err.email);
                if (err?.non_field_errors) return toast.error(err.non_field_errors[0]);
                if (err?.error) return toast.error(err.error);
                toast.error("Login failed. Please try again.");
            },
        });
    };

    // ── REGISTER ───────────────────────────────────────────────────────────────
    const onRegisterSubmit = (data: RegisterFormData) => {
        registerMutate(data, {
            onSuccess: (response: any) => {
                const res = response.data;
                // Registration now returns tokens — log user in immediately
                localStorage.setItem("sxiAccessToken", res.access);
                localStorage.setItem("sixRefreshToken", res.refresh);
                localStorage.setItem("user", JSON.stringify(res.user));
                toast.success("Account created! Welcome to Six 🎉");
                registerForm.reset();
                setTimeout(() => navigate("/checkout"), 1200);
            },
            onError: (error: any) => {
                const err = error?.response?.data;
                if (!err) return toast.error("Something went wrong. Please try again.");
                if (err?.email) return toast.error(Array.isArray(err.email) ? err.email[0] : err.email);
                if (err?.first_name) return toast.error(Array.isArray(err.first_name) ? err.first_name[0] : err.first_name);
                if (err?.last_name) return toast.error(Array.isArray(err.last_name) ? err.last_name[0] : err.last_name);
                if (err?.phone_number) return toast.error(Array.isArray(err.phone_number) ? err.phone_number[0] : err.phone_number);
                if (err?.non_field_errors) return toast.error(err.non_field_errors[0]);
                if (err?.error) return toast.error(err.error);
                toast.error("Registration failed. Please try again.");
            },
        });
    };


    const switchView = (mode: ViewMode) => {
        setViewMode(mode);
        userLoginForm.reset();
        registerForm.reset();
        adminLoginForm.reset();
    };

    const isPending = isLoginPending || isRegisterPending;

    // ── Left panel background image (same for all modes) ──────────────────────
    const leftPanelBg = viewMode === "admin"
        ? `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(15,15,15,0.85) 100%),
           url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80') center/cover no-repeat`
        : `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%),
           url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80') center/cover no-repeat`;

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
                        <div className="absolute inset-0 transition-all duration-500" style={{ background: leftPanelBg }} />
                        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20"
                            style={{ background: "radial-gradient(circle, #ef4444, transparent)" }} />
                        <div className="absolute bottom-16 right-4 w-32 h-32 rounded-full opacity-15"
                            style={{ background: "radial-gradient(circle, #ffffff, transparent)" }} />

                        <div className="absolute bottom-14 left-8 z-10">
                            <span className="text-white text-2xl font-black tracking-tight">6ix</span>
                            <p className="text-white/60 text-sm mt-1">
                                {viewMode === "admin" ? "Manage your store." : "Style. Quality. You."}
                            </p>
                        </div>
                    </div>

                    {/* ── Right Panel ── */}
                    <div className="flex-1 flex flex-col justify-center p-10 py-8 overflow-y-auto">
                        {/* ── USER LOGIN (email only) ── */}
                        {viewMode === "login" && (
                            <>
                                <h2 className="text-2xl font-black text-red-600 mb-1 text-center">Welcome Back</h2>
                                <p className="text-center text-gray-400 text-sm mb-6">Enter your email to sign in</p>

                                <form onSubmit={userLoginForm.handleSubmit(onUserLoginSubmit)} className="space-y-4">
                                    <Controller name="email" control={userLoginForm.control}
                                        rules={{
                                            required: "Email is required",
                                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input {...field} type="email" placeholder="Enter your email"
                                                        autoCapitalize="none" disabled={isPending}
                                                        className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                            ${error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"}`} />
                                                </div>
                                                {error && <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>}
                                            </div>
                                        )}
                                    />

                                    <button type="submit" disabled={isPending}
                                        className="w-full bg-black hover:bg-red-600 disabled:opacity-60 text-white font-black py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]">
                                        Sign In
                                    </button>

                                    <p className="text-center text-sm text-gray-500">
                                        Don't have an account?{" "}
                                        <button type="button" onClick={() => switchView("register")}
                                            className="text-red-600 font-black hover:underline">
                                            Sign Up
                                        </button>
                                    </p>
                                </form>
                            </>
                        )}

                        {/* ── REGISTER ── */}
                        {viewMode === "register" && (
                            <>
                                <h2 className="text-2xl font-black text-red-600 mb-1 text-center">Create Account</h2>
                                <p className="text-center text-gray-400 text-sm mb-5">Join 6ix Units today</p>

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
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input {...field} type="email" placeholder="john@example.com"
                                                        autoCapitalize="none" disabled={isPending}
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

                                    <button type="submit" disabled={isPending}
                                        className="w-full bg-black hover:bg-red-600 disabled:opacity-60 text-white font-black py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]">
                                        Create Account
                                    </button>

                                    <p className="text-center text-sm text-gray-500">
                                        Already have an account?{" "}
                                        <button type="button" onClick={() => switchView("login")}
                                            className="text-red-600 font-black hover:underline">
                                            Sign In
                                        </button>
                                    </p>
                                </form>
                            </>
                        )}

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;