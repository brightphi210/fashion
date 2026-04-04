import { FiInstagram, FiPhone } from "react-icons/fi";

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 mt-auto">
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

      {/* Brand */}
      <span className="text-base font-black tracking-tight text-black">6ix</span>

      {/* Links */}
      <div className="flex items-center gap-5">
        <a
          href="https://www.instagram.com/6ixxunit?igsh=OG80bWhwbnZ1c3c1&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors font-medium"
        >
          <FiInstagram size={15} />
          @6ix
        </a>

        <a
          href="https://wa.me/2341234567"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors font-medium"
        >
          <FiPhone size={14} />
          +234 123 4567
        </a>
      </div>

      {/* Copyright */}
      <p className="text-xs text-gray-400">
        © {new Date().getFullYear()} 6ix. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;