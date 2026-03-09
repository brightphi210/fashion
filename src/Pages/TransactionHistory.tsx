import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiChevronRight,
    FiSearch,
    FiPackage,
    FiCheck,
    FiX,
    FiClock,
    FiFilter,
    FiEye,
    FiCalendar,
    FiCreditCard,
    FiMapPin,
    FiChevronDown,
    FiShoppingBag,
    FiArrowUpRight,
} from "react-icons/fi";
import { HiOutlineTruck } from "react-icons/hi";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionItem = {
  id: number;
  name: string;
  img: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
};

export type Transaction = {
  id: string;           // e.g. "ORD-12345678"
  txRef: string;        // Flutterwave tx_ref
  flwRef?: string;
  date: string;         // ISO string
  status: "successful" | "pending" | "failed";
  amount: number;       // local currency amount
  currency: string;     // e.g. "NGN"
  currencySymbol: string;
  amountUSD: number;
  items: TransactionItem[];
  shippingAddress: string;
  shippingMethod: string;
  coupon?: string;
  email: string;
  name: string;
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

const TX_KEY = "shop_transactions";

export const saveTransaction = (tx: Transaction): void => {
  try {
    const existing: Transaction[] = JSON.parse(localStorage.getItem(TX_KEY) ?? "[]");
    localStorage.setItem(TX_KEY, JSON.stringify([tx, ...existing]));
  } catch { /* silent */ }
};

const loadTransactions = (): Transaction[] => {
  try {
    return JSON.parse(localStorage.getItem(TX_KEY) ?? "[]") as Transaction[];
  } catch { return []; }
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: Transaction["status"] }) => {
  const map = {
    successful: { label: "Successful", bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
    pending:    { label: "Pending",    bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
    failed:     { label: "Failed",     bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({ tx, onClose }: { tx: Transaction; onClose: () => void }) => {
  const fmt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long", timeStyle: "short",
  }).format(new Date(tx.date));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        style={{ animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="font-black text-sm text-black">{tx.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">{fmt}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <FiX size={15} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Amount + status */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-black">
                {tx.currencySymbol}{tx.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{tx.currency} · ${tx.amountUSD.toFixed(2)} USD</p>
            </div>
            <StatusBadge status={tx.status} />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <FiCreditCard size={13} />, label: "Payment Ref",   val: tx.txRef.slice(0, 18) + "…" },
              { icon: <FiCalendar size={13} />,   label: "Date",          val: new Date(tx.date).toLocaleDateString() },
              { icon: <FiMapPin size={13} />,     label: "Ship To",       val: tx.shippingAddress.split(",")[0] },
              { icon: <HiOutlineTruck size={13} />, label: "Method",      val: tx.shippingMethod },
            ].map(({ icon, label, val }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                  {icon}
                  <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-xs font-bold text-gray-800 truncate">{val}</p>
              </div>
            ))}
          </div>

          {/* Customer */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Customer</p>
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-black">{tx.name}</p>
              <p className="text-xs text-gray-500">{tx.email}</p>
              <p className="text-xs text-gray-500">{tx.shippingAddress}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              Items ({tx.items.reduce((s, i) => s + i.quantity, 0)})
            </p>
            <div className="space-y-2.5">
              {tx.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {item.selectedColor && (
                        <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">
                          {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">
                          {item.selectedSize}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">× {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-black shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon */}
          {tx.coupon && tx.coupon !== "none" && (
            <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <p className="text-xs font-black text-green-700">Coupon Applied</p>
              <span className="text-xs font-black text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                {tx.coupon}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <Link
            to="/"
            onClick={onClose}
            className="block w-full text-center bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl text-sm transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <FiShoppingBag size={32} className="text-gray-300" />
    </div>
    <h2 className="text-base font-black text-gray-800 mb-1">No transactions yet</h2>
    <p className="text-sm text-gray-400 max-w-xs mb-6">
      Your order history will appear here once you complete a purchase.
    </p>
    <Link
      to="/"
      className="bg-black hover:bg-gray-800 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
    >
      Start Shopping
    </Link>
  </div>
);

// ─── Stats bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ transactions }: { transactions: Transaction[] }) => {
  const totalSpent = transactions
    .filter((t) => t.status === "successful")
    .reduce((s, t) => s + t.amountUSD, 0);
  const totalOrders    = transactions.length;
  const successCount   = transactions.filter((t) => t.status === "successful").length;
  const totalItems     = transactions
    .flatMap((t) => t.items)
    .reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Total Spent",   value: `$${totalSpent.toFixed(2)}`, icon: <FiCreditCard size={16} /> },
        { label: "Total Orders",  value: totalOrders,                 icon: <FiPackage size={16} />    },
        { label: "Completed",     value: successCount,                icon: <FiCheck size={16} />      },
        { label: "Items Ordered", value: totalItems,                  icon: <FiShoppingBag size={16} />},
      ].map(({ label, value, icon }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">{icon}</span>
            <FiArrowUpRight size={13} className="text-gray-300" />
          </div>
          <p className="text-xl font-black text-black">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Transactions Page ────────────────────────────────────────────────────────

const FILTERS = ["All", "Successful", "Pending", "Failed"] as const;
type Filter = typeof FILTERS[number];

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch]             = useState("");
  const [filter, setFilter]             = useState<Filter>("All");
  const [sortDesc, setSortDesc]         = useState(true);
  const [selected, setSelected]         = useState<Transaction | null>(null);
  const [filterOpen, setFilterOpen]     = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (filter !== "All")
      list = list.filter((t) => t.status === filter.toLowerCase());

    if (search.trim())
      list = list.filter((t) =>
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      );

    list.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return sortDesc ? diff : -diff;
    });

    return list;
  }, [transactions, filter, search, sortDesc]);

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {selected && <DetailModal tx={selected} onClose={() => setSelected(null)} />}

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-red-600 transition-colors font-medium">Home</Link>
          <FiChevronRight size={13} className="text-gray-400" />
          <span className="font-bold text-gray-800">Transaction History</span>
        </nav>

        {/* Page heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-black">Transaction History</h1>
            <p className="text-sm text-gray-400 mt-0.5">{transactions.length} total order{transactions.length !== 1 ? "s" : ""}</p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={() => setSortDesc((v) => !v)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black border border-gray-200 hover:border-black px-3 py-2 rounded-lg transition-colors"
            >
              <FiCalendar size={12} />
              {sortDesc ? "Newest first" : "Oldest first"}
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Stats */}
            <StatsBar transactions={transactions} />

            {/* Search + filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {/* Search */}
              <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-black transition-colors">
                <FiSearch size={15} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order ID, name, or product…"
                  className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-gray-400 hover:text-black transition-colors">
                    <FiX size={14} />
                  </button>
                )}
              </div>

              {/* Filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-black rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors w-full sm:w-auto justify-between sm:justify-start"
                >
                  <FiFilter size={14} />
                  {filter}
                  <FiChevronDown
                    size={13}
                    className="text-gray-400 ml-1"
                    style={{ transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  />
                </button>
                {filterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
                    {FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => { setFilter(f); setFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                          filter === f
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile sort */}
              <button
                onClick={() => setSortDesc((v) => !v)}
                className="sm:hidden flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black border border-gray-200 hover:border-black px-3 py-2.5 rounded-xl transition-colors justify-center"
              >
                <FiCalendar size={12} />
                {sortDesc ? "Newest first" : "Oldest first"}
              </button>
            </div>

            {/* Results count */}
            {search || filter !== "All" ? (
              <p className="text-xs text-gray-400 mb-3">
                Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                {filter !== "All" ? ` for "${filter}"` : ""}
                {search ? ` matching "${search}"` : ""}
              </p>
            ) : null}

            {/* Transaction list */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <FiSearch size={28} className="text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-gray-600 text-sm">No results found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((tx, idx) => {
                  const itemCount = tx.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <div
                      key={tx.id}
                      className="bg-white rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all duration-200 overflow-hidden"
                      style={{
                        animation: `fadeUp 0.3s ease both`,
                        animationDelay: `${idx * 40}ms`,
                      }}
                    >
                      {/* Main row */}
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.status === "successful" ? "bg-green-100" :
                          tx.status === "pending"    ? "bg-yellow-100" : "bg-red-100"
                        }`}>
                          {tx.status === "successful" ? (
                            <FiCheck size={17} className="text-green-600" />
                          ) : tx.status === "pending" ? (
                            <FiClock size={17} className="text-yellow-600" />
                          ) : (
                            <FiX size={17} className="text-red-600" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-black text-black">{tx.id}</p>
                            <StatusBadge status={tx.status} />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(tx.date)}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
                            {tx.items.map((i) => i.name).join(", ")}
                          </p>
                        </div>

                        {/* Amount + action */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-black text-black">
                              {tx.currencySymbol}{tx.amount.toLocaleString()} {tx.currency}
                            </p>
                            {tx.currency !== "USD" && (
                              <p className="text-[10px] text-gray-400">${tx.amountUSD.toFixed(2)} USD</p>
                            )}
                          </div>
                          <button
                            onClick={() => setSelected(tx)}
                            className="flex items-center gap-1 text-xs font-black text-black border border-gray-200 hover:border-black hover:bg-black hover:text-white px-3 py-1.5 rounded-lg transition-all"
                          >
                            <FiEye size={11} /> Details
                          </button>
                        </div>
                      </div>

                      {/* Item images strip */}
                      {tx.items.length > 0 && (
                        <div className="flex items-center gap-2 px-5 pb-4">
                          {tx.items.slice(0, 5).map((item) => (
                            <img
                              key={item.id}
                              src={item.img}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100"
                            />
                          ))}
                          {tx.items.length > 5 && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">
                              +{tx.items.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default TransactionHistory;