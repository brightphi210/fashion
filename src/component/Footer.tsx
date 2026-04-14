import { FiInstagram, FiMail } from "react-icons/fi";

const Footer = () => (
  <footer className="border-t border-[#c9b99a]/12 bg-black">
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

      {/* Brand */}
      <span className="text-base font-black tracking-widest uppercase text-[#c9b99a]">6ix</span>

      {/* Links */}
      <div className="flex items-center gap-5">
        <a
          href="https://www.instagram.com/6ixxunit?igsh=OG80bWhwbnZ1c3c1&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-[#c9b99a]/55 hover:text-[#c9b99a] transition-colors font-medium"
        >
          <FiInstagram size={15} />
          @6ix
        </a>

        <a
          href="mailto:6ixunit@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-[#c9b99a]/55 hover:text-[#c9b99a] transition-colors font-medium"
        >
          <FiMail size={15} />
          6ixunit@gmail.com
        </a>
      </div>

      {/* Copyright */}
      <p className="text-xs text-[#c9b99a]/35 tracking-wide">
        © {new Date().getFullYear()} 6ix. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;