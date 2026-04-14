import {
  FiArrowLeft,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import camo from "../assets/camo.jpg";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useShop } from "../providers/ShopContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useShop();

  if (cart.length === 0) {
    return (
      <div
        className="min-h-screen relative"
        style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
      >
        <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-[#c9b99a]/40 mb-6">
              <Link to="/" className="hover:text-[#c9b99a] transition-colors font-medium">Home</Link>
              <FiChevronRight size={12} />
              <span className="font-bold text-[#c9b99a]/60">Cart</span>
            </nav>

            <div className="border border-[#c9b99a]/12 bg-[#161614]/60 rounded-2xl flex flex-col items-center justify-center py-28 text-center px-4">
              <div className="w-20 h-20 rounded-full bg-[#c9b99a]/6 border border-[#c9b99a]/12 flex items-center justify-center mb-5">
                <FiShoppingCart size={30} className="text-[#c9b99a]/30" />
              </div>
              <h2 className="text-sm font-black text-[#c9b99a] tracking-widest uppercase mb-2">
                Your cart is empty
              </h2>
              <p className="text-xs text-[#c9b99a]/45 mb-8 max-w-xs leading-relaxed">
                Looks like you haven't added anything yet. Browse our collection and find something you love.
              </p>
              <Link
                to="/"
                className="bg-[#c9b99a] hover:bg-[#e0d2b6] text-black font-black px-8 py-3 rounded-md text-xs tracking-widest uppercase transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="max-w-4xl mx-auto w-full px-4 py-8 flex-1">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#c9b99a]/40 mb-6">
            <Link to="/" className="hover:text-[#c9b99a] transition-colors font-medium">Home</Link>
            <FiChevronRight size={12} />
            <span className="font-bold text-[#c9b99a]/60">Cart</span>
          </nav>

          {/* Page heading */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-[3px] h-5 bg-[#c9b99a] rounded-sm" />
            <h1 className="text-base font-black text-[#c9b99a] tracking-widest uppercase">
              Shopping Cart{" "}
              <span className="text-[#c9b99a]/40 font-medium text-sm">({cartCount} items)</span>
            </h1>
          </div>

          <div className="lg:grid grid-cols-2 flex flex-col gap-5">

            {/* ── LEFT ── */}
            <div className="col-span-1 space-y-4">
              <div className="border border-[#c9b99a]/12 bg-[#161614]/60 rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#c9b99a]/8">
                  <h2 className="font-black text-xs text-[#c9b99a]/60 tracking-widest uppercase">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-xs text-[#c9b99a]/40 hover:text-red-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FiTrash2 size={12} /> Clear all
                  </button>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#c9b99a]/6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                      <Link to={`/product/${item.id}`} className="shrink-0">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover bg-black/40 hover:opacity-80 transition-opacity border border-[#c9b99a]/12"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`}>
                          <p className="text-xs font-bold text-[#c9b99a] truncate hover:opacity-70 transition-opacity uppercase tracking-wide">
                            {item.name}
                          </p>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.selectedColor && (
                            <span className="text-[10px] text-[#c9b99a]/55 bg-[#c9b99a]/6 border border-[#c9b99a]/12 px-2 py-0.5 rounded-full tracking-wide">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-[10px] text-[#c9b99a]/55 bg-[#c9b99a]/6 border border-[#c9b99a]/12 px-2 py-0.5 rounded-full tracking-wide">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-black text-white">€{Number(item.price).toLocaleString()}</span>
                          {item.oldPrice && (
                            <span className="text-xs text-[#c9b99a]/30 line-through">€{Number(item.oldPrice).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2.5 shrink-0">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#c9b99a]/30 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <FiTrash2 size={14} />
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-md border border-[#c9b99a]/15 text-[#c9b99a]/50 flex items-center justify-center hover:border-[#c9b99a]/50 hover:text-[#c9b99a] transition-colors cursor-pointer"
                          >
                            <FiMinus size={10} />
                          </button>
                          <span className="w-6 text-center text-sm font-black text-[#c9b99a]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-md border border-[#c9b99a]/15 text-[#c9b99a]/50 flex items-center justify-center hover:border-[#c9b99a]/50 hover:text-[#c9b99a] transition-colors cursor-pointer"
                          >
                            <FiPlus size={10} />
                          </button>
                        </div>
                        <span className="text-xs font-black text-[#c9b99a]/70">
                          €{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs text-[#c9b99a]/40 hover:text-[#c9b99a] font-semibold transition-colors tracking-widest uppercase"
              >
                <FiArrowLeft size={13} /> Continue Shopping
              </Link>
            </div>

            {/* ── RIGHT: Summary ── */}
            <div className="col-span-1 shrink-0">
              <div className="border border-[#c9b99a]/12 bg-[#161614]/60 rounded-2xl p-5 sticky top-24">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-[3px] h-5 bg-[#c9b99a] rounded-sm" />
                  <h2 className="font-black text-xs text-[#c9b99a] tracking-widest uppercase">Order Summary</h2>
                </div>

                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9b99a]/55 text-xs tracking-wide">Subtotal ({cartCount} items)</span>
                    <span className="font-semibold text-[#c9b99a]/70 text-xs">€{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9b99a]/55 text-xs tracking-wide">Shipping</span>
                    <span className="font-black text-green-400 text-xs tracking-wide">Free</span>
                  </div>
                  <div className="border-t border-[#c9b99a]/12 pt-3 flex justify-between items-center">
                    <span className="font-black text-[#c9b99a] uppercase tracking-widest text-xs">Total</span>
                    <span className="font-black text-lg text-white">€{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  state={{ finalTotal: cartTotal }}
                  className="block w-full text-center bg-[#c9b99a] hover:bg-[#e0d2b6] text-black font-black py-3 rounded-md text-[11px] tracking-widest uppercase transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Cart;