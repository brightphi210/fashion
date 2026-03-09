import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiChevronRight, FiCheck } from "react-icons/fi";
import { HiPlay } from "react-icons/hi";
import { products, categories } from "../data/Data";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { useShop } from "../providers/ShopContext";

// ─── Related Product Card ─────────────────────────────────────────────────────

const RelatedCard = ({ product }: { product: (typeof products)[0] }) => {
  const { toggleFavourite, isFavourite, addToCart, isInCart } = useShop();

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.tag && !product.discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-md">
            {product.tag}
          </span>
        )}
        {product.discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-md">
            {product.discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavourite(product);
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform"
        >
          <FiHeart
            size={13}
            className={isFavourite(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>

        {/* Cart overlay */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          className={`absolute bottom-0 left-0 right-0 py-1.5 text-xs font-black flex items-center justify-center gap-1 transition-all duration-300 ${
            isInCart(product.id)
              ? "bg-green-500 text-white translate-y-0 opacity-100"
              : "bg-black text-white translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          <FiShoppingCart size={11} />
          {isInCart(product.id) ? "In Cart" : "Add to Cart"}
        </button>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs font-black text-black">${product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="text-[10px] text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ─── Product Page ─────────────────────────────────────────────────────────────

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart, isInCart, toggleFavourite, isFavourite } = useShop();

  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"details" | "videos">("details");
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-bold text-lg">Product not found</p>
          <Link to="/" className="text-red-600 text-sm font-semibold mt-2 inline-block hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 8);

  const catLabel =
    categories.find((c) => c.slug === product.category)?.label ?? product.category;

  const handleAddToCart = () => {
    addToCart(
      product,
      qty,
      selectedColor || product.colors?.[0],
      selectedSize || product.sizes?.[0]
    );
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const liked = isFavourite(product.id);
  const inCart = isInCart(product.id);

  // Use product.images if available, otherwise fallback to product.img
  const images = product.images?.length ? product.images : [product.img];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          {["Lifestyle", catLabel, product.name].map((label, i, arr) => (
            <span key={label} className="flex items-center gap-1.5">
              {i > 0 && <FiChevronRight size={13} className="text-gray-400" />}
              {i < arr.length - 1 ? (
                <Link
                  to={i === 0 ? "/" : `/category/${product.category}`}
                  className="hover:text-red-600 transition-colors font-medium"
                >
                  {label}
                </Link>
              ) : (
                <span className="font-bold text-gray-800 truncate max-w-40">{label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* ── Top Section ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Images */}
            <div className="md:w-64 shrink-0">
              <div className="rounded-xl overflow-hidden bg-gray-50 mb-3" style={{ aspectRatio: "1/1" }}>
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                      activeImg === i ? "border-red-500" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-xl font-black text-black mb-1">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-black text-black">${product.price.toFixed(2)}</span>
                {product.oldPrice && (
                  <span className="text-base text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
                )}
                {product.discount && (
                  <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Color */}
              {product.colors?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    Color:{" "}
                    <span className="font-normal text-gray-500">
                      {selectedColor || product.colors[0]}
                    </span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                          (selectedColor || product.colors[0]) === color
                            ? "border-black bg-black text-white"
                            : "border-gray-200 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              {product.sizes?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    Size:{" "}
                    <span className="font-normal text-gray-500">
                      {selectedSize || product.sizes[0]}
                    </span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 rounded-lg text-xs font-bold border-2 transition-colors ${
                          (selectedSize || product.sizes[0]) === size
                            ? "border-black bg-black text-white"
                            : "border-gray-200 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-2">Quantity:</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-red-500 hover:text-red-600 transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-black text-sm">{qty}</span>
                  <button
                    onClick={() => setQty((v) => v + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-red-500 hover:text-red-600 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center gap-2 font-black px-5 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                    addedFeedback || inCart
                      ? "bg-green-500 text-white"
                      : "bg-black hover:bg-red-600 text-white"
                  }`}
                >
                  {addedFeedback || inCart ? (
                    <><FiCheck size={16} /> {inCart ? "In Cart" : "Added!"}</>
                  ) : (
                    <><FiShoppingCart size={16} /> Add to Cart</>
                  )}
                </button>
                <button
                  onClick={() => toggleFavourite(product)}
                  className={`flex items-center gap-2 border-2 font-black px-5 py-2.5 rounded-xl text-sm transition-colors ${
                    liked
                      ? "border-red-500 text-red-600 bg-red-50"
                      : "border-gray-200 text-gray-700 hover:border-red-400 hover:text-red-600"
                  }`}
                >
                  <FiHeart size={15} className={liked ? "fill-red-500" : ""} />
                  {liked ? "Favourited" : "Favourite"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex gap-2 mb-5">
            {(["details", "videos"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-sm font-black capitalize transition-colors ${
                  tab === t
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Details Tab */}
          {tab === "details" && (
            <div>
              <h3 className="font-black text-base text-black mb-2">Product Details</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Category", catLabel],
                  ["Available Sizes", product.sizes?.join(", ") || "—"],
                  ["Available Colors", product.colors?.join(", ") || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {tab === "videos" && (
            <div>
              <h3 className="font-black text-base text-black mb-3">Product Videos</h3>
              {product.videos?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.videos.map((v) => (
                    <div
                      key={v.id}
                      className="relative rounded-xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <img
                        src={v.thumb}
                        alt="video"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                          <HiPlay size={20} className="text-black ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-2 text-white text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">
                        {v.duration}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">🎬</p>
                  <p className="text-sm font-semibold">No videos available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-black">Related Products</h2>
              <Link
                to={`/category/${product.category}`}
                className="text-sm text-red-600 font-bold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <FiChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map((p) => (
                <RelatedCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Product;