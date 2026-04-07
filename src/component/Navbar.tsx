import { useEffect, useRef, useState } from "react";
import {
  FiChevronDown,
  FiHeart,
  FiMenu,
  FiMinus,
  FiPackage,
  FiPlus,
  FiSearch,
  FiShoppingCart,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/six.jpg";
import { useShop } from "../providers/ShopContext";

// ── Static fallback categories matching your admin (Hats, Hoodies, Longsleeves, New, Pants, Shorts, T-Shirts)
const FALLBACK_CATEGORIES = [
  { label: "Hats", slug: "hats" },
  { label: "Hoodies", slug: "hoodies" },
  { label: "Longsleeves", slug: "longsleeves" },
  { label: "New", slug: "new" },
  { label: "Pants", slug: "pants" },
  { label: "Shorts", slug: "shorts" },
  { label: "T-Shirts", slug: "t-shirts" },
];

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.6ixunit.store";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [navCategories, setNavCategories] = useState(FALLBACK_CATEGORIES);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { cartCount, cartTotal, cart, removeFromCart, updateQuantity, favouriteCount } = useShop();

  // Fetch categories from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/categories/`)
      .then((r) => r.json())
      .then((data: { label: string; slug: string }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setNavCategories(data);
        }
      })
      .catch(() => {
        // silently keep fallback
      });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, cartOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAll = () => { setMenuOpen(false); setCartOpen(false); };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
    setMobileSearchQuery("");
    setMenuOpen(false);
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/search?q=${encodeURIComponent(slug)}`);
    setDropdown(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.82)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.04)",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-4 flex-1">
            <Link to="/" className="flex items-center shrink-0 w-10 h-10 rounded overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </Link>

            {/* Category dropdown — desktop */}
            <div ref={dropdownRef} className="hidden md:block relative shrink-0">
              <button
                onClick={() => setDropdown((v) => !v)}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-black/5"
              >
                Category
                <FiChevronDown
                  size={14}
                  style={{
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
              <div
                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                style={{
                  opacity: dropdownOpen ? 1 : 0,
                  transform: dropdownOpen ? "translateY(0)" : "translateY(-8px)",
                  pointerEvents: dropdownOpen ? "auto" : "none",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
              >
                {navCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="w-full text-left block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search — desktop */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-sm items-center bg-black/5 rounded-full px-4 py-2 gap-2 focus-within:bg-black/8 focus-within:ring-1 focus-within:ring-black/10 transition-all"
            >
              <FiSearch className="text-gray-400 shrink-0" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <FiX size={13} />
                </button>
              )}
            </form>
          </div>

          {/* RIGHT — desktop */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <Link
              to="/orders"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-black/5 whitespace-nowrap"
            >
              <FiPackage size={16} />
              Orders
            </Link>

            <Link
              to="/favourites"
              className="relative p-2.5 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-black/5"
            >
              <FiHeart size={20} />
              {favouriteCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black leading-none">
                  {favouriteCount > 9 ? "9+" : favouriteCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => { setMenuOpen(false); setCartOpen((v) => !v); }}
              className="relative p-2.5 text-black bg-black/10 hover:bg-black hover:text-white rounded-full cursor-pointer transition-all duration-200 ml-1"
            >
              <FiShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>

          {/* RIGHT — mobile */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button
              onClick={() => { setMenuOpen(false); setCartOpen((v) => !v); }}
              className="relative p-2 text-white bg-black rounded-full"
            >
              <FiShoppingCart size={17} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setCartOpen(false); setMenuOpen((v) => !v); }}
              className="p-2 rounded-lg text-gray-700 hover:bg-black/5 transition-colors"
            >
              <span style={{ display: "block", transform: menuOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div className="h-16" />

      {/* BACKDROP */}
      <div
        onClick={closeAll}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 49,
          backdropFilter: menuOpen || cartOpen ? "blur(4px)" : "blur(0px)",
          WebkitBackdropFilter: menuOpen || cartOpen ? "blur(4px)" : "blur(0px)",
          backgroundColor: menuOpen || cartOpen ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
          pointerEvents: menuOpen || cartOpen ? "auto" : "none",
          transition: "backdrop-filter 0.3s ease, background-color 0.3s ease",
        }}
      />

      {/* CART DRAWER */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "min(360px, 100vw)",
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
          transform: cartOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="flex items-center justify-between px-5 shrink-0" style={{ height: 64, borderBottom: "1px solid #f0f0f0" }}>
          <div className="flex items-center gap-2">
            <FiShoppingCart size={18} className="text-black" />
            <span className="font-black text-base text-black">
              My Cart{" "}
              <span className="text-gray-400 font-semibold text-sm">({cartCount})</span>
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400 px-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FiShoppingCart size={30} className="opacity-30" />
            </div>
            <p className="font-black text-gray-700 text-sm mb-1">Your cart is empty</p>
            <p className="text-xs text-center text-gray-400">Add some products and they'll appear here.</p>
            <button
              onClick={() => setCartOpen(false)}
              className="mt-6 bg-black text-white font-black text-sm px-6 py-2.5 rounded-xl hover:bg-red-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto" style={{ borderBottom: "1px solid #f0f0f0" }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-4"
                  style={{ borderBottom: "1px solid #fafafa" }}
                >
                  <Link to={`/product/${item.id}`} onClick={() => setCartOpen(false)} className="shrink-0">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`} onClick={() => setCartOpen(false)}>
                      <p className="text-xs font-bold text-gray-900 truncate hover:text-red-600 transition-colors mb-0.5">
                        {item.name}
                      </p>
                    </Link>
                    {item.selectedColor && (
                      <p className="text-[10px] text-gray-400">{item.selectedColor}{item.selectedSize ? ` · ${item.selectedSize}` : ""}</p>
                    )}
                    <p className="text-sm font-black text-black mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-600 transition-colors"
                      >
                        <FiMinus size={9} />
                      </button>
                      <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-600 transition-colors"
                      >
                        <FiPlus size={9} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-gray-50 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""})</span>
                <span className="text-xs font-semibold text-gray-700">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black text-black">Total</span>
                <span className="text-xl font-black text-black">${cartTotal.toFixed(2)}</span>
              </div>
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="block w-full text-center bg-black hover:bg-red-600 text-white font-black py-3 rounded-xl text-sm transition-colors mb-2.5"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={() => setCartOpen(false)}
                className="w-full text-center text-gray-500 font-semibold text-sm py-2 hover:text-black transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>

      {/* MOBILE MENU DRAWER */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 288,
          zIndex: 55,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          boxShadow: "-4px 0 30px rgba(0,0,0,0.12)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="md:hidden"
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <span className="font-black text-lg text-black">Menu</span>
          <button onClick={() => setMenuOpen(false)} className="p-2 text-gray-500 hover:text-black">
            <FiX size={22} />
          </button>
        </div>

        <div className="px-5 py-4">
          <form onSubmit={handleMobileSearchSubmit} className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
            <FiSearch className="text-gray-400 shrink-0" size={15} />
            <input
              type="text"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
            />
            {mobileSearchQuery ? (
              <button type="submit" className="text-gray-500 hover:text-black">
                <FiSearch size={13} />
              </button>
            ) : null}
          </form>
        </div>

        <div className="px-5 pb-2 overflow-y-auto flex-1">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Categories</p>
          <ul className="space-y-0.5">
            {navCategories.map((cat, i) => (
              <li key={cat.slug}>
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(cat.slug)}`);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
                  style={{
                    opacity: menuOpen ? 1 : 0,
                    transform: menuOpen ? "translateX(0)" : "translateX(20px)",
                    transition: `opacity 0.3s ease ${0.05 * i + 0.15}s, transform 0.3s ease ${0.05 * i + 0.15}s`,
                  }}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-5 my-2 border-t border-gray-100" />

        <div className="px-5 flex flex-col gap-1 pb-6">
          <Link
            to="/orders"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            <FiPackage size={17} /> Order History
          </Link>
          <Link
            to="/favourites"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            <FiHeart size={17} />
            Wishlist
            {favouriteCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {favouriteCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;