import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-black text-white mt-16">
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 rounded-sm text-white text-xs font-black">
            S
          </span>
          <span className="text-lg font-black tracking-tight">StoreOne</span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Your go-to destination for modern fashion. Style, quality, and value — all in one place.
        </p>
      </div>

      {/* Shop */}
      <div>
        <h4 className="font-black text-sm uppercase tracking-widest mb-4 text-red-500">Shop</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          {["Clothing", "Hoodies", "Jackets", "Pants", "Accessories"].map((item) => (
            <li key={item}>
              <Link
                to={`/category/${item.toLowerCase()}`}
                className="hover:text-white transition-colors"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Help */}
      <div>
        <h4 className="font-black text-sm uppercase tracking-widest mb-4 text-red-500">Help</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          {["FAQs", "Shipping Info", "Returns", "Track Order", "Contact Us"].map((item) => (
            <li key={item}>
              <Link to="#" className="hover:text-white transition-colors">
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter */}
      <div>
        <h4 className="font-black text-sm uppercase tracking-widest mb-4 text-red-500">Newsletter</h4>
        <p className="text-gray-400 text-sm mb-3">Get deals and new arrivals in your inbox.</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Your email"
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500 transition-colors"
          />
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-black transition-colors">
            Go
          </button>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <span>© {new Date().getFullYear()} StoreOne. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer