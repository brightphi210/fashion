import { useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTag,
  FiTrash2,
} from "react-icons/fi";
import {
  HiOutlineCreditCard,
  HiOutlineShieldCheck,
  HiOutlineTruck,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useShop } from "../providers/ShopContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useShop();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const discount = couponApplied ? parseFloat((cartTotal * 0.1).toFixed(2)) : 0;
  const finalTotal = cartTotal - discount;

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === "SAVE10") setCouponApplied(true);
  };

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-black transition-colors font-medium">Home</Link>
            <FiChevronRight size={13} />
            <span className="font-bold text-gray-800">Cart</span>
          </nav>
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-28 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <FiShoppingCart size={32} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-black text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-xs">
              Looks like you haven't added anything yet. Browse our collection and find something you love.
            </p>
            <Link
              to="/"
              className="bg-black hover:bg-red-600 text-white font-black px-8 py-3 rounded-xl text-sm transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-black transition-colors font-medium">Home</Link>
          <FiChevronRight size={13} />
          <span className="font-bold text-gray-800">Cart</span>
        </nav>

        <h1 className="text-xl font-black text-black mb-6">
          Shopping Cart{" "}
          <span className="text-gray-400 font-semibold text-base">({cartCount} items)</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── LEFT ── */}
          <div className="flex-1 space-y-4">

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-black text-sm text-black">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-xs text-gray-400 hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
                >
                  <FiTrash2 size={12} /> Clear all
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <Link to={`/product/${item.id}`} className="shrink-0">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100 hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <p className="text-sm font-bold text-gray-900 truncate hover:text-red-600 transition-colors">
                          {item.name}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.selectedColor && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            Size: {item.selectedSize}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-black text-black">${Number(item.price).toLocaleString()}</span>
                        {item.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">${Number(item.oldPrice).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2.5 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-black hover:text-black transition-colors"
                        >
                          <FiMinus size={10} />
                        </button>
                        <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-black hover:text-black transition-colors"
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>
                      <span className="text-xs font-black text-gray-800">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiTag size={15} className="text-gray-400" />
                <span className="text-sm font-black text-black">Coupon Code</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code..."
                  disabled={couponApplied}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors disabled:bg-gray-50 disabled:text-gray-400 font-medium"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || !coupon}
                  className={`px-4 py-2.5 rounded-xl text-sm font-black transition-colors ${couponApplied
                    ? "bg-green-500 text-white"
                    : "bg-black hover:bg-red-600 text-white disabled:bg-gray-100 disabled:text-gray-400"
                    }`}
                >
                  {couponApplied ? <FiCheck size={15} /> : "Apply"}
                </button>
              </div>
              {couponApplied && (
                <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                  <FiCheck size={11} /> Coupon "SAVE10" applied — 10% off!
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Try code: <strong className="text-gray-600">SAVE10</strong>
              </p>
            </div>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-black font-semibold transition-colors"
            >
              <FiArrowLeft size={13} /> Continue Shopping
            </Link>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h2 className="font-black text-sm text-black mb-4">Order Summary</h2>

              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({cartCount} items)</span>
                  <span className="font-semibold text-gray-800">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold">Coupon (SAVE10)</span>
                    <span className="font-semibold text-green-600">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-black text-black">Total</span>
                  <span className="font-black text-lg text-black">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                state={{ discount, finalTotal, couponCode: couponApplied ? "SAVE10" : null }}
                className="block w-full text-center bg-black hover:bg-red-600 text-white font-black py-3 rounded-xl text-sm transition-colors mb-3"
              >
                Proceed to Checkout
              </Link>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                {[
                  { icon: <HiOutlineTruck size={16} />, label: "Free Delivery" },
                  { icon: <HiOutlineShieldCheck size={16} />, label: "Secure Pay" },
                  { icon: <HiOutlineCreditCard size={16} />, label: "Easy Returns" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 text-center">
                    <div className="text-gray-400">{icon}</div>
                    <span className="text-[10px] text-gray-400 font-semibold leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;