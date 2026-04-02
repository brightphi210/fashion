import { useState } from "react";
import {
  FiArrowLeft,
  FiSearch,
  FiShoppingCart,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useShop } from "../providers/ShopContext";

// ── Confirmation Modal ─────────────────────────────────────────────────────
const ConfirmModal = ({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div
    className="fixed inset-0 z-[999] flex items-center justify-center px-4"
    style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      style={{ animation: "cardIn 0.3s cubic-bezier(0.34,1.2,0.64,1) both" }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <FiTrash2 size={24} className="text-red-500" />
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-black text-center mb-1 tracking-tight">
        Clear all favourites?
      </h3>
      <p className="text-sm text-gray-400 text-center mb-6" style={{ fontFamily: "'Epilogue', sans-serif" }}>
        This will remove all <strong className="text-gray-600">{count}</strong> saved item{count !== 1 ? "s" : ""} from your wishlist. This action cannot be undone.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
        >
          Yes, Clear All
        </button>
      </div>
    </div>
  </div>
);

// ── Favourite ──────────────────────────────────────────────────────────────
const Favourite = () => {
  const { favourites, removeFromFavourites, addToCart, isInCart } = useShop();
  const [search, setSearch] = useState("");
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [addedId, setAddedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"saved" | "price_asc" | "price_desc">("saved");
  const [showClearModal, setShowClearModal] = useState(false);

  const handleRemove = (id: number) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      removeFromFavourites(id);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.info("Removed from favourites");
    }, 380);
  };

  const handleAddToCart = (product: any) => {
    if (isInCart(product.id)) return;
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
    toast.success(`"${product.name}" added to cart!`);
  };

  const handleClearConfirmed = () => {
    favourites.forEach((p: any) => removeFromFavourites(p.id));
    setShowClearModal(false);
    toast.success("Favourites cleared!");
  };

  const filtered = favourites
    .filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });

  const inCartCount = favourites.filter((p: any) => isInCart(p.id)).length;

  return (
    <div className="bg-gray-50 min-h-screen" style={{ fontFamily: "'Syne', sans-serif" }}>
      <link
        rel="stylesheet"
      />

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cardOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.9) translateY(-8px); }
        }
        @keyframes addedPulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fav-card-enter { animation: cardIn 0.42s cubic-bezier(0.34,1.2,0.64,1) both; }
        .fav-card-exit  { animation: cardOut 0.38s ease forwards; pointer-events: none; }
        .fav-img { transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94); }
        .fav-card-wrap:hover .fav-img { transform: scale(1.06); }
        .fav-remove-btn {
          opacity: 0;
          transform: scale(0.85);
          transition: opacity 0.2s, transform 0.2s, background 0.2s;
        }
        .fav-card-wrap:hover .fav-remove-btn { opacity: 1; transform: scale(1); }
        .fav-remove-btn:hover { transform: scale(1.12) !important; }
        .added-anim { animation: addedPulse 0.6s ease; }
        .stat-card { animation: slideDown 0.35s ease both; }
        .sort-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 28px;
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />

      {/* Confirmation Modal */}
      {showClearModal && (
        <ConfirmModal
          count={favourites.length}
          onConfirm={handleClearConfirmed}
          onCancel={() => setShowClearModal(false)}
        />
      )}

      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pb-20 pt-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ fontFamily: "'Epilogue', sans-serif" }}>
          <Link to="/" className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors font-medium">
            <FiArrowLeft size={12} />
            Home
          </Link>
          <span className="text-gray-200">·</span>
          <span className="text-gray-800 font-semibold">Favourites</span>
        </nav>

        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HiHeart className="text-red-500" size={18} />
              <span className="text-xs font-semibold tracking-widest text-red-500 uppercase" style={{ fontFamily: "'Epilogue', sans-serif", letterSpacing: "0.14em" }}>
                Saved Items
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-black tracking-tight leading-none" style={{ letterSpacing: "-0.04em" }}>
              My Favourites
            </h1>
          </div>

          {favourites.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="stat-card bg-white border border-gray-100 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-sm">
                <HiHeart className="text-red-400" size={14} />
                <span className="text-xs font-semibold text-gray-700" style={{ fontFamily: "'Epilogue', sans-serif" }}>
                  <strong className="text-black" style={{ fontFamily: "'Syne', sans-serif" }}>{favourites.length}</strong> saved
                </span>
              </div>
              {inCartCount > 0 && (
                <div className="stat-card bg-green-50 border border-green-100 rounded-xl px-3.5 py-2 flex items-center gap-2" style={{ animationDelay: "0.07s" }}>
                  <FiShoppingCart className="text-green-500" size={13} />
                  <span className="text-xs font-semibold text-green-700" style={{ fontFamily: "'Epilogue', sans-serif" }}>
                    <strong style={{ fontFamily: "'Syne', sans-serif" }}>{inCartCount}</strong> in cart
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {favourites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-28 text-center px-6 shadow-sm">
            <div className="relative mb-7">
              <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <HiOutlineHeart size={34} className="text-red-300" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white" style={{ fontSize: 11, fontWeight: 800 }}>
                0
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-black mb-2 tracking-tight" style={{ letterSpacing: "-0.03em" }}>
              Nothing saved yet
            </h2>
            <p className="text-sm text-gray-400 mb-8 max-w-60 leading-relaxed" style={{ fontFamily: "'Epilogue', sans-serif", fontWeight: 300 }}>
              Tap the <HiHeart className="inline text-red-400" size={13} /> heart on any product to save it here.
            </p>
            <Link to="/" className="group inline-flex items-center gap-2 bg-black hover:bg-red-600 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]">
              <HiOutlineFire size={15} />
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row lg:gap-10 gap-3 mb-6">
              <div className="flex-1 flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-50 transition-all">
                <FiSearch size={14} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search saved items…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-300"
                  style={{ fontFamily: "'Epilogue', sans-serif" }}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500 transition-colors">
                    <FiX size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 justify-between">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="sort-select bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-600 outline-none hover:border-gray-300 transition-colors cursor-pointer"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  <option value="saved">Saved order</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>

                {/* Clear all — now opens modal */}
                <button
                  onClick={() => setShowClearModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <FiTrash2 size={12} />
                  Clear All
                </button>
              </div>
            </div>

            {/* No search results */}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <p className="text-base font-bold text-gray-700 mb-1">No items match "{search}"</p>
                <p className="text-sm text-gray-400" style={{ fontFamily: "'Epilogue', sans-serif" }}>Try a different search term</p>
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product: any, i: number) => {
                const inCart = isInCart(product.id);
                const isAdded = addedId === product.id;
                const exiting = removingIds.has(product.id);
                const badgeLabel = product.tag || (product.discount ? `-${product.discount}%` : null);

                return (
                  <div
                    key={product.id}
                    className={`fav-card-wrap group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 ${exiting ? "fav-card-exit" : "fav-card-enter"}`}
                    style={{ animationDelay: `${i * 0.045}s` }}
                  >
                    <Link to={`/product/${product.id}`} className="block relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
                      <img src={product.img} alt={product.name} className="fav-img w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {badgeLabel && (
                        <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wide uppercase">
                          {badgeLabel}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); handleRemove(product.id); }}
                        className="fav-remove-btn absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Remove from favourites"
                      >
                        <HiHeart size={15} />
                      </button>
                    </Link>

                    <div className="p-3.5">
                      <Link to={`/product/${product.id}`}>
                        <p className="text-sm font-bold text-gray-900 truncate hover:text-red-600 transition-colors mb-0.5" style={{ letterSpacing: "-0.01em" }}>
                          {product.name}
                        </p>
                      </Link>

                      {product.colors?.length > 0 && (
                        <p className="text-[11px] text-gray-400 truncate mb-2" style={{ fontFamily: "'Epilogue', sans-serif" }}>
                          {product.colors.slice(0, 3).join(" · ")}
                          {product.colors.length > 3 && <span className="text-gray-300"> +{product.colors.length - 3}</span>}
                        </p>
                      )}

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-base font-extrabold text-black" style={{ letterSpacing: "-0.02em" }}>
                          ${Number(product.price).toFixed(2)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-300 line-through" style={{ fontFamily: "'Epilogue', sans-serif" }}>
                            ${Number(product.oldPrice).toFixed(2)}
                          </span>
                        )}
                        {product.discount && (
                          <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${isAdded
                          ? "bg-green-500 text-white added-anim scale-[1.02]"
                          : inCart
                            ? "bg-gray-50 border-[1.5px] border-green-400 text-green-600 hover:bg-green-50"
                            : "bg-black hover:bg-red-600 text-white hover:scale-[1.02]"
                          }`}
                        style={{ letterSpacing: "0.03em" }}
                      >
                        <FiShoppingCart size={13} />
                        {isAdded ? "Added!" : inCart ? "In Cart" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length > 0 && (
              <p className="text-center text-xs text-gray-300 mt-10" style={{ fontFamily: "'Epilogue', sans-serif" }}>
                Showing {filtered.length} of {favourites.length} saved item{favourites.length !== 1 ? "s" : ""}
              </p>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Favourite;