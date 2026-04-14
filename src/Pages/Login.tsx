import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiMail, FiPhone, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import camo from "../assets/camo.jpg";
import Footer from "../component/Footer";
import LoadingOverlay from "../component/LoadingOverlay";
import Navbar from "../component/Navbar";
import { useLogin, useRegistration } from "../hooks/mutations/auth";

interface UserLoginFormData { email: string; }
interface RegisterFormData { first_name: string; last_name: string; email: string; phone_number: string; }

type ViewMode = "login" | "register";

const inputClass = (error?: boolean) =>
    `w-full px-4 py-3 rounded-md text-sm outline-none transition-all bg-transparent border placeholder:text-[#c9b99a]/25 text-[#c9b99a] ${error
        ? "border-red-500/50 focus:border-red-400"
        : "border-[#c9b99a]/15 focus:border-[#c9b99a]/50"
    }`;

const Login = () => {
    const [viewMode, setViewMode] = useState<ViewMode>("login");

    const { mutate: loginMutate, isPending: isLoginPending } = useLogin();
    const { mutate: registerMutate, isPending: isRegisterPending } = useRegistration();
    const navigate = useNavigate();

    const userLoginForm = useForm<UserLoginFormData>({ defaultValues: { email: "" } });
    const registerForm = useForm<RegisterFormData>({
        defaultValues: { first_name: "", last_name: "", email: "", phone_number: "" },
    });

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

    const onRegisterSubmit = (data: RegisterFormData) => {
        registerMutate(data, {
            onSuccess: (response: any) => {
                const res = response.data;
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
                toast.error("Registration failed. Please try again.");
            },
        });
    };

    const switchView = (mode: ViewMode) => {
        setViewMode(mode);
        userLoginForm.reset();
        registerForm.reset();
    };

    const isPending = isLoginPending || isRegisterPending;

    return (
        <>
            <div
                className="min-h-screen relative"
                style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
            >
                <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                    <ToastContainer theme="dark" />
                    <LoadingOverlay visible={isPending} />

                    <div className="flex-1 flex items-center justify-center px-4 py-10">
                        <div
                            className="w-full max-w-4xl border border-[#c9b99a]/15 rounded-2xl overflow-hidden flex"
                            style={{ minHeight: "560px" }}
                        >
                            {/* ── Left Panel ── */}
                            <div
                                className="hidden md:flex w-5/12 relative flex-col justify-end p-10"
                                style={{
                                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80')`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            >
                                {/* Tactical overlay */}
                                <div className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage: `repeating-linear-gradient(45deg, rgba(201,185,154,0.03) 0px, rgba(201,185,154,0.03) 1px, transparent 1px, transparent 20px)`,
                                    }}
                                />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-[3px] h-6 bg-[#c9b99a] rounded-sm" />
                                        <span className="text-[#c9b99a] text-2xl font-black tracking-widest uppercase">6ix</span>
                                    </div>
                                    <p className="text-[#c9b99a]/55 text-sm tracking-wide">
                                        {viewMode === "register" ? "Join the unit." : "Style. Quality. You."}
                                    </p>
                                </div>
                            </div>

                            {/* ── Right Panel ── */}
                            <div className="flex-1 flex flex-col justify-center p-8 py-10 overflow-y-auto">

                                {/* Login */}
                                {viewMode === "login" && (
                                    <>
                                        <div className="mb-6">
                                            <h2 className="text-xl font-black text-[#c9b99a] tracking-widest uppercase mb-1">Welcome Back</h2>
                                            <p className="text-[#c9b99a]/45 text-sm">Enter your email to sign in</p>
                                        </div>

                                        <form onSubmit={userLoginForm.handleSubmit(onUserLoginSubmit)} className="space-y-4">
                                            <Controller
                                                name="email"
                                                control={userLoginForm.control}
                                                rules={{
                                                    required: "Email is required",
                                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <div>
                                                        <label className="block text-xs font-black text-[#c9b99a]/55 mb-1.5 tracking-widest uppercase">
                                                            Email Address <span className="text-red-400">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9b99a]/35" size={15} />
                                                            <input
                                                                {...field}
                                                                type="email"
                                                                placeholder="Enter your email"
                                                                autoCapitalize="none"
                                                                disabled={isPending}
                                                                className={`${inputClass(!!error)} pl-10`}
                                                            />
                                                        </div>
                                                        {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
                                                    </div>
                                                )}
                                            />

                                            <button
                                                type="submit"
                                                disabled={isPending}
                                                className="w-full bg-[#c9b99a] hover:bg-[#e0d2b6] disabled:opacity-50 text-black font-black py-3.5 rounded-md transition-all text-sm tracking-widest uppercase cursor-pointer active:scale-[0.98]"
                                            >
                                                Sign In
                                            </button>

                                            <p className="text-center text-sm text-[#c9b99a]/45">
                                                Don't have an account?{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => switchView("register")}
                                                    className="text-[#c9b99a] font-black hover:opacity-70 transition-opacity cursor-pointer"
                                                >
                                                    Sign Up
                                                </button>
                                            </p>
                                        </form>
                                    </>
                                )}

                                {/* Register */}
                                {viewMode === "register" && (
                                    <>
                                        <div className="mb-6">
                                            <h2 className="text-xl font-black text-[#c9b99a] tracking-widest uppercase mb-1">Create Account</h2>
                                            <p className="text-[#c9b99a]/45 text-sm">Join 6ix Units today</p>
                                        </div>

                                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <Controller
                                                    name="first_name"
                                                    control={registerForm.control}
                                                    rules={{ required: "Required", minLength: { value: 2, message: "Min 2 chars" } }}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <div>
                                                            <label className="block text-xs font-black text-[#c9b99a]/55 mb-1.5 tracking-widest uppercase">
                                                                First Name <span className="text-red-400">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9b99a]/35" size={14} />
                                                                <input {...field} type="text" placeholder="John" disabled={isPending} className={`${inputClass(!!error)} pl-10`} />
                                                            </div>
                                                            {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="last_name"
                                                    control={registerForm.control}
                                                    rules={{ required: "Required", minLength: { value: 2, message: "Min 2 chars" } }}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <div>
                                                            <label className="block text-xs font-black text-[#c9b99a]/55 mb-1.5 tracking-widest uppercase">
                                                                Last Name <span className="text-red-400">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9b99a]/35" size={14} />
                                                                <input {...field} type="text" placeholder="Doe" disabled={isPending} className={`${inputClass(!!error)} pl-10`} />
                                                            </div>
                                                            {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            <Controller
                                                name="email"
                                                control={registerForm.control}
                                                rules={{
                                                    required: "Email is required",
                                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <div>
                                                        <label className="block text-xs font-black text-[#c9b99a]/55 mb-1.5 tracking-widest uppercase">
                                                            Email Address <span className="text-red-400">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9b99a]/35" size={14} />
                                                            <input {...field} type="email" placeholder="john@example.com" autoCapitalize="none" disabled={isPending} className={`${inputClass(!!error)} pl-10`} />
                                                        </div>
                                                        {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
                                                    </div>
                                                )}
                                            />

                                            <Controller
                                                name="phone_number"
                                                control={registerForm.control}
                                                rules={{
                                                    required: "Phone number is required",
                                                    pattern: { value: /^\+?[0-9\s\-().]{7,20}$/, message: "Enter a valid phone number" },
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <div>
                                                        <label className="block text-xs font-black text-[#c9b99a]/55 mb-1.5 tracking-widest uppercase">
                                                            Phone Number <span className="text-red-400">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9b99a]/35" size={14} />
                                                            <input {...field} type="tel" placeholder="+1 234 567 890" disabled={isPending} className={`${inputClass(!!error)} pl-10`} />
                                                        </div>
                                                        {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
                                                    </div>
                                                )}
                                            />

                                            <button
                                                type="submit"
                                                disabled={isPending}
                                                className="w-full bg-[#c9b99a] hover:bg-[#e0d2b6] disabled:opacity-50 text-black font-black py-3.5 rounded-md transition-all text-sm tracking-widest uppercase cursor-pointer active:scale-[0.98]"
                                            >
                                                Create Account
                                            </button>

                                            <p className="text-center text-sm text-[#c9b99a]/45">
                                                Already have an account?{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => switchView("login")}
                                                    className="text-[#c9b99a] font-black hover:opacity-70 transition-opacity cursor-pointer"
                                                >
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
                </div>
            </div>
        </>
    );
};

export default Login;