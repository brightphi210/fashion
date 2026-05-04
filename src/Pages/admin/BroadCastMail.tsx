import { useState } from "react";
import {
    FiDownload,
    FiMail,
    FiSearch,
    FiUsers,
} from "react-icons/fi";
// import { useGetNewsletterSubscribers } from "../../hooks/mutations/allMutation";
import { useGetAdminEmailSubscribers } from "../../hooks/mutations/allMutation";

const BroadcastMail = () => {
    const { emailSubscribers, isLoading } = useGetAdminEmailSubscribers();
    const [search, setSearch] = useState("");

    const allSubscribers: any[] = Array.isArray(emailSubscribers?.data) ? emailSubscribers.data : [];

    const filtered = allSubscribers.filter((s) => {
        const q = search.toLowerCase();
        return (
            s.email?.toLowerCase().includes(q) ||
            s.name?.toLowerCase().includes(q)
        );
    });

    const exportCSV = () => {
        const rows = [["Name", "Email", "Subscribed At"]];
        allSubscribers.forEach((s) =>
            rows.push([s.name || "—", s.email, s.subscribed_at ?? ""])
        );
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "newsletter_subscribers.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="lg:p-6 p-3 space-y-7 max-w-6xl">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Newsletter</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {isLoading ? "Loading…" : `${allSubscribers.length} subscriber${allSubscribers.length !== 1 ? "s" : ""} total`}
                    </p>
                </div>
                <button
                    onClick={exportCSV}
                    disabled={allSubscribers.length === 0}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-40 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                    <FiDownload size={15} /> Export CSV
                </button>
            </div>

            {/* Stat Card */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-purple-50 text-purple-600">
                        <FiUsers size={18} />
                    </div>
                    {isLoading ? (
                        <div className="h-6 w-20 bg-gray-100 rounded-lg animate-pulse mb-1.5" />
                    ) : (
                        <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                            {allSubscribers.length}
                        </p>
                    )}
                    <p className="text-xs font-semibold text-gray-400 mt-1">Total Subscribers</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600">
                        <FiMail size={18} />
                    </div>
                    {isLoading ? (
                        <div className="h-6 w-20 bg-gray-100 rounded-lg animate-pulse mb-1.5" />
                    ) : (
                        <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                            {allSubscribers.filter((s) => s.name).length}
                        </p>
                    )}
                    <p className="text-xs font-semibold text-gray-400 mt-1">With Names</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-100 rounded-xl outline-none bg-white text-gray-700 placeholder:text-gray-300 focus:border-gray-300 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-3 py-3 border-b border-gray-50 bg-gray-50/60">
                    <p className="col-span-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">#</p>
                    <p className="col-span-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</p>
                    <p className="col-span-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                </div>

                {isLoading ? (
                    <div className="divide-y divide-gray-50">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="grid grid-cols-12 px-3 py-4 items-center animate-pulse gap-4">
                                <div className="col-span-1 h-3 w-4 bg-gray-100 rounded-full" />
                                <div className="col-span-4 h-3 w-28 bg-gray-100 rounded-full" />
                                <div className="col-span-5 h-3 w-40 bg-gray-100 rounded-full" />
                                <div className="col-span-2 h-3 w-16 bg-gray-100 rounded-full ml-auto" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <FiMail size={28} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                            {search ? "No subscribers match your search." : "No subscribers yet."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map((s: any, i: number) => (
                            <div
                                key={s.email}
                                className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors"
                            >
                                <p className="col-span-1 text-[11px] font-black text-gray-300">{i + 1}</p>

                                <div className="col-span-4 flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-purple-600">
                                            {(s.name || s.email)?.[0]?.toUpperCase() ?? "?"}
                                        </span>
                                    </div>
                                    <p className="text-xs font-black text-gray-800 truncate">
                                        {s.name || <span className="text-gray-300 font-semibold">No name</span>}
                                    </p>
                                </div>

                                <div className="col-span-5 flex items-center gap-1.5">
                                    <FiMail size={11} className="text-gray-300 shrink-0" />
                                    <p className="text-xs text-gray-500 truncate">{s.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BroadcastMail;