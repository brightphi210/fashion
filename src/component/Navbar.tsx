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
import logo from "../assets/six.png";
import { useShop } from "../providers/ShopContext";

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

  useEffect(() => {
    fetch(`${API_BASE}/api/categories/`)
      .then((r) => r.json())
      .then((data: { label: string; slug: string }[]) => {
        if (Array.isArray(data) && data.length > 0) setNavCategories(data);
      })
      .catch(() => { });
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b ${scrolled
          ? "bg-[#080603] border-[#c9b99a]/25 shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
          : "bg-[#100e0a] border-[#c9b99a]/10"
          }`}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-4 flex-1">
            <Link to="/" className="shrink-0">
              <img
                src={logo}
                alt="Logo"
                className="w-9 h-9 rounded-md object-cover border border-[#c9b99a]/25"
              />
            </Link>

            {/* Category dropdown — desktop only */}
            <div ref={dropdownRef} className="hidden md:block relative shrink-0">
              <button
                onClick={() => setDropdown((v) => !v)}
                className={`flex items-center gap-1 text-xs font-semibold tracking-widest uppercase px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${dropdownOpen
                  ? "text-[#c9b99a] bg-[#c9b99a]/8"
                  : "text-[#c9b99a]/55 hover:text-[#c9b99a] hover:bg-[#c9b99a]/5"
                  }`}
              >
                Category
                <FiChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : "rotate-0"}`}
                />
              </button>

              {/* Dropdown panel */}
              <div
                className={`absolute top-[calc(100%+8px)] left-0 w-48 bg-[#1a1a18] border border-[#c9b99a]/25 rounded-lg overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)] transition-all duration-200 ${dropdownOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
              >
                {navCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium tracking-wide uppercase text-[#c9b99a]/55 hover:text-[#c9b99a] hover:bg-[#c9b99a]/8 border-b border-[#c9b99a]/6 transition-all duration-150 cursor-pointer"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search — desktop only */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-sm items-center bg-white/2 border border-[#c9b99a]/12 rounded-full px-4 py-2 gap-2 focus-within:border-[#c9b99a]/30 transition-all"
            >
              <FiSearch className="text-[#c9b99a]/55 shrink-0" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent border-none outline-none text-sm w-full text-[#c9b99a] placeholder:text-[#c9b99a]/35 tracking-wide"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[#c9b99a]/40 hover:text-[#c9b99a] transition-colors cursor-pointer"
                >
                  <FiX size={12} />
                </button>
              )}
            </form>
          </div>

          {/* RIGHT — desktop */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <Link
              to="/orders"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-widest uppercase text-[#c9b99a]/55 hover:text-[#c9b99a] rounded-md hover:bg-[#c9b99a]/5 transition-all"
            >
              <FiPackage size={15} />
              Orders
            </Link>

            <Link
              to="/favourites"
              className="relative p-2.5 text-[#c9b99a]/55 hover:text-[#c9b99a] rounded-md hover:bg-[#c9b99a]/5 transition-all"
            >
              <FiHeart size={19} />
              {favouriteCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black leading-none">
                  {favouriteCount > 9 ? "9+" : favouriteCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => { setMenuOpen(false); setCartOpen((v) => !v); }}
              className="relative p-2.5 ml-1 text-[#c9b99a] bg-[#c9b99a]/10 border border-[#c9b99a]/25 rounded-full hover:bg-[#c9b99a]/20 transition-all duration-200 cursor-pointer"
            >
              <FiShoppingCart size={17} />
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
              className="relative p-2 text-[#c9b99a] bg-[#c9b99a]/10 border border-[#c9b99a]/25 rounded-full transition-all cursor-pointer"
            >
              <FiShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setCartOpen(false); setMenuOpen((v) => !v); }}
              className="p-2 text-[#c9b99a] hover:bg-[#c9b99a]/5 rounded-md transition-colors cursor-pointer"
            >
              <span
                className="block transition-transform duration-250"
                style={{ transform: menuOpen ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16" />

      {/* ── BACKDROP ── */}
      <div
        onClick={closeAll}
        className={`fixed inset-0 z-49 transition-all duration-300 ${menuOpen || cartOpen
          ? "backdrop-blur-md bg-black/70 pointer-events-auto"
          : "backdrop-blur-none bg-black/0 pointer-events-none"
          }`}
      />

      {/* ── CART DRAWER ── */}
      <div
        className={`fixed top-0 right-0 h-full z-60 flex flex-col bg-[#161614] border-l border-[#c9b99a]/25 shadow-[-12px_0_60px_rgba(0,0,0,0.7)] transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ width: "min(380px, 100vw)" }}
      >
        {/* Cart header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#c9b99a]/12 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-[3px] h-[18px] bg-[#c9b99a] rounded-sm" />
            <FiShoppingCart size={16} className="text-[#c9b99a]" />
            <span className="font-bold text-base tracking-widest uppercase text-[#c9b99a]">
              My Cart{" "}
              <span className="text-[#c9b99a]/55 font-medium text-sm">({cartCount})</span>
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c9b99a]/55 bg-white/5 border border-[#c9b99a]/12 hover:text-[#c9b99a] transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        {cart.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center flex-1 px-6">
            <div className="w-18 h-18 rounded-full bg-[#c9b99a]/6 border border-[#c9b99a]/12 flex items-center justify-center mb-4">
              <FiShoppingCart size={26} className="text-[#c9b99a]/55" />
            </div>
            <p className="font-bold text-[#c9b99a] text-sm tracking-widest uppercase mb-1.5">Cart is empty</p>
            <p className="text-xs text-[#c9b99a]/55 text-center mb-6">Add some products and they'll appear here.</p>
            <button
              onClick={() => setCartOpen(false)}
              className="bg-transparent border border-[#c9b99a]/25 text-[#c9b99a] font-bold text-xs tracking-widest uppercase px-6 py-2.5 rounded-md hover:bg-[#c9b99a]/10 transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto border-b border-[#c9b99a]/12">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-[#c9b99a]/5"
                >
                  <Link
                    to={`/product/${item.id}`}
                    onClick={() => setCartOpen(false)}
                    className="shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover bg-[#222] border border-[#c9b99a]/12"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      onClick={() => setCartOpen(false)}
                      className="no-underline"
                    >
                      <p className="text-xs font-bold text-[#c9b99a] tracking-wide uppercase truncate mb-0.5 hover:opacity-70 transition-opacity">
                        {item.name}
                      </p>
                    </Link>
                    {item.selectedColor && (
                      <p className="text-[10px] text-[#c9b99a]/55 mb-1">
                        {item.selectedColor}{item.selectedSize ? ` · ${item.selectedSize}` : ""}
                      </p>
                    )}
                    <p className="text-sm font-black text-white">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#c9b99a]/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    >
                      <FiTrash2 size={13} />
                    </button>
                    <div className="flex items-center gap-1 bg-[#c9b99a]/6 border border-[#c9b99a]/12 rounded-md px-1 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-5 h-5 rounded flex items-center justify-center border border-[#c9b99a]/12 text-[#c9b99a]/55 hover:border-[#c9b99a] hover:text-[#c9b99a] transition-all cursor-pointer"
                      >
                        <FiMinus size={8} />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-[#c9b99a]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-5 h-5 rounded flex items-center justify-center border border-[#c9b99a]/12 text-[#c9b99a]/55 hover:border-[#c9b99a] hover:text-[#c9b99a] transition-all cursor-pointer"
                      >
                        <FiPlus size={8} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart footer */}
            <div className="px-5 py-4 bg-black/30 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#c9b99a]/55 tracking-widest uppercase">
                  Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""})
                </span>
                <span className="text-[11px] text-[#c9b99a]/55">€{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-[#c9b99a] tracking-widest uppercase">Total</span>
                <span className="text-xl font-black text-white">€{cartTotal.toFixed(2)}</span>
              </div>
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="block w-full text-center bg-[#c9b99a] text-black font-bold text-xs tracking-widest uppercase py-3 rounded-md hover:bg-[#e0d2b6] transition-colors mb-2 no-underline"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={() => setCartOpen(false)}
                className="w-full text-center text-[#c9b99a]/55 font-semibold text-xs tracking-widest uppercase py-2 hover:text-[#c9b99a] transition-colors bg-transparent border-none cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── MOBILE MENU DRAWER ── */}
      <div
        className={`fixed top-0 right-0 h-full w-75 z-55 flex flex-col bg-[#161614] border-l border-[#c9b99a]/25 shadow-[-8px_0_40px_rgba(0,0,0,0.6)] transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#c9b99a]/12 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Logo"
              className="w-8 h-8 rounded-md object-cover border border-[#c9b99a]/25"
            />
            <span className="font-bold text-base tracking-[0.12em] uppercase text-[#c9b99a]">Menu</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-[#c9b99a]/55 hover:text-[#c9b99a] transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-3">
          <form
            onSubmit={handleMobileSearchSubmit}
            className="flex items-center bg-white/6 border border-[#c9b99a]/12 rounded-full px-4 py-2.5 gap-2 focus-within:border-[#c9b99a]/30 transition-all"
          >
            <FiSearch className="text-[#c9b99a]/55 shrink-0" size={14} />
            <input
              type="text"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent border-none outline-none text-sm w-full text-[#c9b99a] placeholder:text-[#c9b99a]/35 tracking-wide"
            />
          </form>
        </div>

        {/* Categories */}
        <div className="px-5 pt-2 flex-1 overflow-y-auto">
          <p className="text-[11px] font-bold text-[#c9b99a]/55 tracking-[0.16em] uppercase mb-2">
            Categories
          </p>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c9b99a]/20 to-transparent mb-2" />
          <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
            {navCategories.map((cat, i) => (
              <li key={cat.slug}>
                <button
                  onClick={() => { navigate(`/search?q=${encodeURIComponent(cat.slug)}`); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold tracking-wide uppercase text-[#c9b99a]/55 hover:text-[#c9b99a] hover:bg-[#c9b99a]/8 transition-all duration-150 cursor-pointer"
                  style={{
                    opacity: menuOpen ? 1 : 0,
                    transform: menuOpen ? "translateX(0)" : "translateX(16px)",
                    transition: `opacity 0.3s ease ${0.04 * i + 0.1}s, transform 0.3s ease ${0.04 * i + 0.1}s, background 0.15s, color 0.15s`,
                  }}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="mx-5 my-2 h-px bg-gradient-to-r from-transparent via-[#c9b99a]/20 to-transparent" />

        {/* Bottom links */}
        <div className="px-5 pb-6 flex flex-col gap-0.5">
          <Link
            to="/orders"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold tracking-widest uppercase text-[#c9b99a]/55 hover:text-[#c9b99a] hover:bg-[#c9b99a]/5 transition-all no-underline"
          >
            <FiPackage size={16} />
            Order History
          </Link>
          <Link
            to="/favourites"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold tracking-widest uppercase text-[#c9b99a]/55 hover:text-[#c9b99a] hover:bg-[#c9b99a]/5 transition-all no-underline"
          >
            <FiHeart size={16} />
            Wishlist
            {favouriteCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
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