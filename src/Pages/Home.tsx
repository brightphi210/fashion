import { useState, useRef } from "react";
import { FiHeart, FiChevronLeft, FiChevronRight, FiShoppingCart } from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";
import { Link } from "react-router-dom";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { categories, products } from "../data/Data";
import { useShop } from "../providers/ShopContext";


// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({ product }: { product: (typeof products)[0] }) => {
  const { toggleFavourite, isFavourite, addToCart, isInCart } = useShop();
  const liked = isFavourite(product.id);
  const inCart = isInCart(product.id);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 block"
    >
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.tag && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-md">
            {product.tag}
          </span>
        )}
        {/* Favourite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavourite(product);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
        >
          <FiHeart
            size={15}
            className={liked ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>

        {/* Add to cart overlay on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          className={`absolute bottom-0 left-0 right-0 py-2 text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-300 ${
            inCart
              ? "bg-green-500 text-white translate-y-0 opacity-100"
              : "bg-black text-white translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          <FiShoppingCart size={13} />
          {inCart ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-black text-black">${product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ─── Home ─────────────────────────────────────────────────────────────────────

const Home = () => {
  const [activeBanner, setActiveBanner] = useState(0);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const banners = [
    {
      title: "50% off for",
      subtitle: "clothing and shoes",
      bg: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
    },
    {
      title: "New Season",
      subtitle: "arrivals are here",
      bg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    },
    {
      title: "Flash Sale",
      subtitle: "up to 70% off today",
      bg: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80",
    },
  ];

  const scrollCategories = (dir: "left" | "right") => {
    categoryScrollRef.current?.scrollBy({
      left: dir === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pb-0">

        {/* ── Hero Banner ── */}
        <div className="relative rounded-2xl overflow-hidden mb-8 mt-4" style={{ height: "240px" }}>
          {banners.map((b, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-700"
              style={{ opacity: activeBanner === i ? 1 : 0, zIndex: activeBanner === i ? 1 : 0 }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%), url(${b.bg}) center/cover no-repeat`,
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-center pl-8">
                <p className="text-white text-2xl font-black leading-tight drop-shadow-lg">
                  {b.title}<br />{b.subtitle}
                </p>
                <Link
                  to="/category/clothing"
                  className="mt-4 w-fit bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}

          <div className="absolute bottom-3 left-8 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                className={`rounded-full transition-all duration-300 ${
                  activeBanner === i ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"
                }`}
              />
            ))}
          </div>

          <button
            className="absolute right-12 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
            onClick={() => setActiveBanner((v) => (v - 1 + banners.length) % banners.length)}
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
            onClick={() => setActiveBanner((v) => (v + 1) % banners.length)}
          >
            <FiChevronRight size={16} />
          </button>
        </div>

        {/* ── Browse By Category ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-black">Browse By Category</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCategories("left")}
                className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-red-500 hover:text-red-600 transition-colors"
              >
                <FiChevronLeft size={15} />
              </button>
              <button
                onClick={() => scrollCategories("right")}
                className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-red-500 hover:text-red-600 transition-colors"
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>

          <div
            ref={categoryScrollRef}
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center lg:w-35.5 w-26 gap-2 shrink-0 cursor-pointer"
              >
                <div
                  className="w-full rounded-xl overflow-hidden border-2 border-transparent transition-all duration-200"
                  style={{ aspectRatio: "1/1" }}
                >
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors text-center">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── New Arrivals ── */}
        <section className="pb-16">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineFire className="text-red-500" size={22} />
            <h2 className="text-lg font-black text-black">New Arrival</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Home;