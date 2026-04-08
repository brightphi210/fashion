import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiLock, FiMail, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../component/Footer";
import LoadingOverlay from "../component/LoadingOverlay";
import Navbar from "../component/Navbar";
import { useAdminLogin } from "../hooks/mutations/auth";

interface AdminLoginFormData {
    email: string;
    password: string;
}

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { mutate: adminLoginMutate, isPending } = useAdminLogin();
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<AdminLoginFormData>({
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (data: AdminLoginFormData) => {
        adminLoginMutate(data, {
            onSuccess: (response: any) => {
                const res = response.data;
                localStorage.setItem("sxiAccessToken", res.access);
                localStorage.setItem("sixRefreshToken", res.refresh);
                localStorage.setItem("user", JSON.stringify(res.user));
                toast.success("Admin login successful!");
                reset();
                setTimeout(() => navigate("/admin/overview"), 1200);
            },
            onError: (error: any) => {
                const err = error?.response?.data;
                if (!err) return toast.error("Something went wrong. Please try again.");
                if (err?.email) return toast.error(Array.isArray(err.email) ? err.email[0] : err.email);
                if (err?.password) return toast.error(Array.isArray(err.password) ? err.password[0] : err.password);
                if (err?.non_field_errors) return toast.error(err.non_field_errors[0]);
                if (err?.error) return toast.error(err.error);
                toast.error("Admin login failed. Please try again.");
            },
        });
    };

    return (
        <>
            <Navbar />
            <ToastContainer />
            <LoadingOverlay visible={isPending} />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
                <div
                    className="w-full max-w-5xl bg-white rounded-3xl border border-neutral-100 overflow-hidden flex"
                    style={{ minHeight: "520px" }}
                >
                    {/* ── Left Panel ── */}
                    <div className="hidden md:block w-5/12 relative">
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(15,15,15,0.85) 100%),
                                    url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80') center/cover no-repeat`,
                            }}
                        />
                        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20"
                            style={{ background: "radial-gradient(circle, #ef4444, transparent)" }} />
                        <div className="absolute bottom-16 right-4 w-32 h-32 rounded-full opacity-15"
                            style={{ background: "radial-gradient(circle, #ffffff, transparent)" }} />

                        <div className="absolute top-8 left-8 z-10 flex items-center gap-2">
                            <FiShield className="text-white" size={20} />
                            <span className="text-white text-sm font-semibold tracking-wide uppercase">
                                Admin Portal
                            </span>
                        </div>

                        <div className="absolute bottom-14 left-8 z-10">
                            <span className="text-white text-2xl font-black tracking-tight">6ix</span>
                            <p className="text-white/60 text-sm mt-1">Manage your store.</p>
                        </div>
                    </div>

                    {/* ── Right Panel ── */}
                    <div className="flex-1 flex flex-col justify-center p-10 py-8">

                        <div className="flex items-center gap-2 mb-1 justify-center">
                            <FiShield className="text-red-600" size={22} />
                            <h2 className="text-2xl font-black text-red-600">Admin Login</h2>
                        </div>
                        <p className="text-center text-gray-400 text-sm mb-8">Staff access only</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <Controller
                                name="email"
                                control={control}
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Admin Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FiMail
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                size={16}
                                            />
                                            <input
                                                {...field}
                                                type="email"
                                                placeholder="admin@example.com"
                                                autoCapitalize="none"
                                                disabled={isPending}
                                                className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                    ${error
                                                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                        : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                                    }`}
                                            />
                                        </div>
                                        {error && (
                                            <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            {/* Password */}
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: "Password is required" }}
                                render={({ field, fieldState: { error } }) => (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FiLock
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                size={16}
                                            />
                                            <input
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                disabled={isPending}
                                                className={`w-full pl-9 pr-10 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300
                                                    ${error
                                                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                        : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                            >
                                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                            </button>
                                        </div>
                                        {error && (
                                            <p className="text-red-500 text-xs mt-1 pl-1">{error.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-black hover:bg-red-600 disabled:opacity-60 text-white font-black py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <FiShield size={15} /> Sign In as Admin
                            </button>

                            <p className="text-center text-sm text-gray-500 pt-1">
                                Not an admin?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="text-red-600 font-black hover:underline"
                                >
                                    Go to Customer Login
                                </button>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AdminLogin;