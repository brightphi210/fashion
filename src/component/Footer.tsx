import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-black text-white mt-16">
    <div className="max-w-5xl mx-auto px-4 py-12 flex justify-between gap-8">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-lg font-black tracking-tight">6ix</span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Your go-to destination for modern fashion. <br /> Style, quality, and value — all in one place.
        </p>
      </div>

      {/* Help */}
      <div>
        <h4 className="font-black text-sm uppercase tracking-widest mb-4 text-red-500">Help</h4>
        <ul className=" space-y-1 text-sm text-gray-400">
          {["FAQs", "Contact Us"].map((item) => (
            <li key={item}>
              <Link to="#" className="hover:text-white transition-colors">
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

  </footer>
);

export default Footer