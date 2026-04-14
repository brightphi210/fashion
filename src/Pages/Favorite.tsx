import { useState } from "react";
import {
  FiArrowLeft,
  FiSearch,
  FiTrash2,
  FiX
} from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import camo from "../assets/camo.jpg";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useShop } from "../providers/ShopContext";

const ConfirmModal = ({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md">
    <div className="border border-[#c9b99a]/25 rounded-2xl w-full max-w-sm p-6 bg-[#161614]">
      <div className="flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <FiTrash2 size={22} className="text-red-400" />
        </div>
      </div>
      <h3 className="text-base font-black text-[#c9b99a] text-center mb-1 tracking-widest uppercase">
        Clear all favourites?
      </h3>
      <p className="text-sm text-[#c9b99a]/45 text-center mb-6">
        This will remove all <strong className="text-[#c9b99a]">{count}</strong> saved item{count !== 1 ? "s" : ""} from your wishlist. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-md border border-[#c9b99a]/20 text-sm font-bold text-[#c9b99a]/55 hover:text-[#c9b99a] hover:border-[#c9b99a]/40 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-md bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 text-red-400 text-sm font-bold transition-colors cursor-pointer"
        >
          Yes, Clear All
        </button>
      </div>
    </div>
  </div>
);

const Favourite = () => {
  const { favourites, removeFromFavourites } = useShop();
  const [search, setSearch] = useState("");
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<"saved" | "price_asc" | "price_desc">("saved");
  const [showClearModal, setShowClearModal] = useState(false);

  const handleRemove = (id: number) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      removeFromFavourites(id);
      setRemovingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      toast.info("Removed from favourites");
    }, 380);
  };

  // const handleAddToCart = (product: any) => {
  //   if (isInCart(product.id)) return;
  //   addToCart(product);
  //   setAddedId(product.id);
  //   setTimeout(() => setAddedId(null), 2000);
  //   toast.success(`"${product.name}" added to cart!`);
  // };

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

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cardOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.9) translateY(-8px); }
        }
        .fav-card-enter { animation: cardIn 0.4s cubic-bezier(0.34,1.2,0.64,1) both; }
        .fav-card-exit  { animation: cardOut 0.38s ease forwards; pointer-events: none; }
        .fav-img { transition: transform 0.5s ease; }
        .fav-card-wrap:hover .fav-img { transform: scale(1.06); }
        .fav-remove-btn { opacity: 0; transform: scale(0.85); transition: opacity 0.2s, transform 0.2s; }
        .fav-card-wrap:hover .fav-remove-btn { opacity: 1; transform: scale(1); }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />

      {showClearModal && (
        <ConfirmModal
          count={favourites.length}
          onConfirm={handleClearConfirmed}
          onCancel={() => setShowClearModal(false)}
        />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 pb-20 pt-8 flex-1 w-full min-w-0">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-8">
            <Link to="/" className="flex items-center gap-1.5 text-[#c9b99a]/40 hover:text-[#c9b99a] transition-colors font-medium">
              <FiArrowLeft size={12} />
              Home
            </Link>
            <span className="text-[#c9b99a]/20">·</span>
            <span className="text-[#c9b99a] font-semibold uppercase tracking-widest">Favourites</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-[3px] h-5 bg-[#c9b99a] rounded-sm" />
              <h1 className="text-base font-black text-[#c9b99a] tracking-widest uppercase">
                My Favourites
              </h1>
            </div>

            {favourites.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-[#c9b99a]/55 border border-[#c9b99a]/15 px-2.5 py-1 rounded-full">
                  <strong className="text-[#c9b99a]">{favourites.length}</strong> saved
                </span>
              </div>
            )}
          </div>

          {/* Empty State */}
          {favourites.length === 0 ? (
            <div className="border border-[#c9b99a]/12 rounded-xl flex flex-col items-center justify-center py-24 text-center px-6">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-[#c9b99a]/6 border border-[#c9b99a]/12 flex items-center justify-center">
                  <HiOutlineHeart size={30} className="text-[#c9b99a]/30" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#c9b99a] flex items-center justify-center text-black text-[10px] font-black">
                  0
                </div>
              </div>
              <h2 className="text-sm font-black text-[#c9b99a] mb-2 tracking-widest uppercase">Nothing saved yet</h2>
              <p className="text-xs text-[#c9b99a]/45 mb-7 max-w-56 leading-relaxed">
                Tap the <HiHeart className="inline text-[#c9b99a]/60" size={12} /> heart on any product to save it here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#c9b99a] hover:bg-[#e0d2b6] text-black font-black text-xs px-6 py-3 rounded-md tracking-widest uppercase transition-all duration-200"
              >
                <HiOutlineFire size={14} />
                Explore Products
              </Link>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 flex items-center gap-2.5 border border-[#c9b99a]/15 rounded-xl px-4 py-2.5 focus-within:border-[#c9b99a]/40 transition-all min-w-0">
                  <FiSearch size={13} className="text-[#c9b99a]/40 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search saved items…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 text-xs text-[#c9b99a] outline-none bg-transparent placeholder:text-[#c9b99a]/25 min-w-0"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-[#c9b99a]/30 hover:text-[#c9b99a] transition-colors cursor-pointer shrink-0">
                      <FiX size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border border-[#c9b99a]/15 rounded-xl px-3 py-2.5 text-[10px] font-semibold text-[#c9b99a]/55 outline-none hover:border-[#c9b99a]/35 transition-colors cursor-pointer"
                  >
                    <option value="saved">Saved order</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                  </select>

                  <button
                    onClick={() => setShowClearModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#c9b99a]/15 text-[10px] font-bold text-[#c9b99a]/40 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/6 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <FiTrash2 size={11} />
                    Clear All
                  </button>
                </div>
              </div>

              {/* No search results */}
              {filtered.length === 0 && (
                <div className="border border-[#c9b99a]/12 rounded-xl py-14 text-center">
                  <p className="text-sm font-bold text-[#c9b99a] mb-1 tracking-wide">No items match "{search}"</p>
                  <p className="text-xs text-[#c9b99a]/40">Try a different search term</p>
                </div>
              )}

              {/* Product Grid — same layout as Home */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((product: any, i: number) => {
                  const exiting = removingIds.has(product.id);
                  const badgeLabel = product.tag || (product.discount ? `-${product.discount}%` : null);

                  return (
                    <div
                      key={product.id}
                      className={`fav-card-wrap group overflow-hidden transition-all duration-300 ${exiting ? "fav-card-exit" : "fav-card-enter"}`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      {/* Image — no background, matches ProductCard */}
                      <Link
                        to={`/product/${product.id}`}
                        className="block relative overflow-hidden aspect-square"
                      >
                        <img
                          src={product.img}
                          alt={product.name}
                          className="fav-img w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                        {/* Badge */}
                        {badgeLabel && (
                          <span className="absolute top-2.5 left-2.5 bg-[#c9b99a]/55 text-[#28251e] text-[10px] font-bold px-2 py-0.5 tracking-widest">
                            {badgeLabel}
                          </span>
                        )}

                        {/* Remove (heart) button */}
                        <button
                          onClick={(e) => { e.preventDefault(); handleRemove(product.id); }}
                          className="fav-remove-btn absolute top-2.5 right-2.5 w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                        >
                          <HiHeart size={13} className="fill-[#c9b99a]/55 text-[#c9b99a]/55" />
                        </button>
                      </Link>

                      {/* Card body — matches ProductCard */}
                      <div className="py-3 px-1 text-[#c9b99a]/55 text-center">
                        <Link to={`/product/${product.id}`}>
                          <p className="text-xs font-bold text-[#c9b99a]/55 mb-0.5 uppercase tracking-wide truncate hover:opacity-70 transition-opacity">
                            {product.name}
                          </p>
                        </Link>

                        {product.colors?.length > 0 && (
                          <p className="text-xs truncate uppercase mb-2 pt-2 text-[#c9b99a]/55">
                            [ {typeof product.colors[0] === "object" ? product.colors[0]?.name : product.colors[0]} ]
                          </p>
                        )}

                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-xs font-black">€{Number(product.price).toFixed(2)}</span>
                          {product.old_price && (
                            <span className="text-[10px] opacity-40 line-through">€{Number(product.old_price).toFixed(2)}</span>
                          )}
                        </div>
                        {/* 
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs w-full justify-center font-bold tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${isAdded
                            ? "bg-[#c9b99a]/55 text-[#28251e]"
                            : inCart
                              ? "bg-white/10 border border-[#c9b99a]/20 text-[#c9b99a]/55"
                              : "bg-white/10 hover:bg-white/20 text-[#c9b99a]/55"
                            }`}
                        >
                          <FiShoppingCart size={12} />
                          {isAdded ? "Added!" : inCart ? "In Cart" : "Add to Cart"}
                        </button> */}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length > 0 && (
                <p className="text-center text-[10px] text-[#c9b99a]/25 mt-10 tracking-wide">
                  Showing {filtered.length} of {favourites.length} saved item{favourites.length !== 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Favourite;