import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShare2,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiX,
  FiZoomIn,
} from "react-icons/fi";
import { HiOutlineFire, HiPlay } from "react-icons/hi";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useGetSingleProduct } from "../hooks/mutations/allMutation";
import { useShop } from "../providers/ShopContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const getMediaUrl = (path: any) => {
  if (!path || typeof path !== "string") return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}/media/${path}`;
};

const safeStr = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object")
    return String(val.label ?? val.name ?? val.title ?? val.slug ?? "");
  return String(val);
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) => {
  const [current, setCurrent] = useState(startIndex);

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
      >
        <FiX size={20} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tabular-nums z-10">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
        >
          <FiChevronLeft size={22} />
        </button>
      )}

      {/* Main image */}
      <div
        className="relative flex items-center justify-center px-16 py-10 w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={current}
          src={images[current]}
          alt=""
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          style={{
            maxHeight: "calc(100vh - 120px)",
            animation: "fadeInScale 0.2s ease",
          }}
        />
      </div>

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
        >
          <FiChevronRight size={22} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${current === i
                ? "border-white scale-110"
                : "border-white/20 opacity-50 hover:opacity-80 hover:border-white/50"
                }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="bg-gray-50 min-h-screen">
    <Navbar />
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex items-center gap-2 mb-6">
        {[12, 20, 12, 28, 12, 40].map((w, i) => (
          <div key={i} className="h-3 rounded-full bg-gray-200" style={{ width: w * 4 }} />
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-[420px] shrink-0 space-y-3">
          <div className="rounded-2xl bg-gray-200" style={{ aspectRatio: "1/1" }} />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-16 rounded-xl bg-gray-200 shrink-0" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-4 w-20 bg-gray-200 rounded-full" />
          <div className="h-8 w-3/4 bg-gray-200 rounded-xl" />
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-gray-200" />
            ))}
            <div className="h-4 w-16 bg-gray-200 rounded-full ml-2" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-28 bg-gray-200 rounded-xl" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-12 w-40 bg-gray-200 rounded-xl" />
            <div className="h-12 w-36 bg-gray-200 rounded-xl" />
            <div className="h-12 w-10 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-5">
        <div className="flex gap-2 mb-5">
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 5 / 6, 4 / 6].map((w, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded-full" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
      </div>
      <div className="mt-8">
        <div className="h-5 w-40 bg-gray-200 rounded-full mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
              <div className="bg-gray-200" style={{ aspectRatio: "1/1" }} />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 bg-gray-200 rounded-full" />
                <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

// ─── Related Card ─────────────────────────────────────────────────────────────
const RelatedCard = ({ product }: { product: any }) => {
  const { toggleFavourite, isFavourite, addToCart, isInCart } = useShop();
  const name = safeStr(product.name);
  const imgSrc = getMediaUrl(product.img ?? product.image ?? "");
  const price = parseFloat(product.price) || 0;
  const oldPrice = product.old_price ? parseFloat(product.old_price) : null;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavourite(product);
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform"
        >
          <FiHeart
            size={12}
            className={isFavourite(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          className={`absolute bottom-0 left-0 right-0 py-1.5 text-xs font-black flex items-center justify-center gap-1 transition-all duration-300 ${isInCart(product.id)
            ? "bg-green-500 text-white translate-y-0 opacity-100"
            : "bg-black text-white translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            }`}
        >
          <FiShoppingCart size={11} />
          {isInCart(product.id) ? "In Cart" : "Add to Cart"}
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-gray-900 truncate">{name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs font-black text-black">${price.toFixed(2)}</span>
          {oldPrice && (
            <span className="text-[10px] text-gray-400 line-through">${oldPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ─── Main Product Page ────────────────────────────────────────────────────────
const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, toggleFavourite, isFavourite } = useShop();

  const { product: productData, isLoading, isError } = useGetSingleProduct(Number(id));
  const product = productData?.data ?? productData;

  // -1 = show cover image, 0+ = show gallery image at that index
  const [activeImg, setActiveImg] = useState(-1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"details" | "videos">("details");
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reset active image when product changes
  useEffect(() => {
    setActiveImg(-1);
  }, [id]);

  if (isLoading) return <ProductSkeleton />;

  if (isError || !product) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <FiShoppingCart size={30} className="text-gray-300" />
            </div>
            <p className="font-black text-xl text-gray-800 mb-2">Product not found</p>
            <p className="text-sm text-gray-400 mb-6">
              This product may have been removed or doesn't exist.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 bg-black text-white font-black px-6 py-3 rounded-xl text-sm hover:bg-red-600 transition-colors"
            >
              <FiArrowLeft size={14} /> Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  // Cover image — always product.img
  const coverUrl = getMediaUrl(product?.img ?? product?.image ?? "");

  // Gallery images from images array: [{id, img, order}, ...]
  const images: string[] = (() => {
    const gallery = product.images as
      | Array<{ id: number; img: string; order: number }>
      | undefined;
    if (gallery && gallery.length > 0) {
      return [...gallery]
        .sort((a, b) => a.order - b.order)
        .map((item) => getMediaUrl(item.img));
    }
    return [];
  })();

  // All images for lightbox: cover first, then gallery
  const allLightboxImages = [coverUrl, ...images].filter(Boolean);

  // Colors: [{id, name}, ...]
  const colors: string[] = (() => {
    const raw = product.colors as Array<{ id: number; name: string }> | undefined;
    if (!raw || raw.length === 0) return [];
    return raw.map((c) => (typeof c === "object" ? c.name : String(c)));
  })();

  // Sizes: [{id, name}, ...]
  const sizes: string[] = (() => {
    const raw = product.sizes as Array<{ id: number; name: string }> | undefined;
    if (!raw || raw.length === 0) return [];
    return raw.map((s) => (typeof s === "object" ? s.name : String(s)));
  })();

  const activeColor = selectedColor || colors[0] || "";
  const activeSize = selectedSize || sizes[0] || "";

  const catLabel = safeStr(product.category);
  const catSlug =
    typeof product.category === "object"
      ? (product.category?.slug ?? catLabel)
      : catLabel;

  const liked = isFavourite(product.id);
  const inCart = isInCart(product.id);

  const price = parseFloat(product.price) || 0;
  const oldPrice = product.old_price ? parseFloat(product.old_price) : null;
  const discount = product.discount ? Number(product.discount) : null;

  const rating = Number(product.rating) || 4.3;
  const reviews = Number(product.reviews) || 128;

  // Currently displayed big image src
  const displayedImageSrc = activeImg === -1 ? coverUrl : images[activeImg];

  // Lightbox index for currently displayed image
  const currentLightboxIndex = activeImg === -1 ? 0 : activeImg + 1;

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        img: coverUrl,
        selectedColor: activeColor,
        selectedSize: activeSize,
      },
      qty
    );
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Lightbox — cover + all gallery images */}
      {lightboxOpen && (
        <Lightbox
          images={allLightboxImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-black transition-colors font-medium">
            Home
          </Link>
          <FiChevronRight size={13} />
          {catLabel && (
            <>
              <Link
                to={`/search?q=${encodeURIComponent(catSlug)}`}
                className="hover:text-black transition-colors font-medium"
              >
                {catLabel}
              </Link>
              <FiChevronRight size={13} />
            </>
          )}
          <span className="font-bold text-gray-800 truncate max-w-50p">
            {safeStr(product.name)}
          </span>
        </nav>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="flex flex-col lg:flex-row gap-7">

            {/* ── Image column ── */}
            <div className="lg:w-100 shrink-0">

              {/* Big main image — shows cover by default, gallery image when thumbnail clicked */}
              <div
                className="rounded-2xl overflow-hidden bg-gray-50 relative mb-3 cursor-zoom-in group"
                style={{ aspectRatio: "1/1" }}
                onClick={() => openLightbox(currentLightboxIndex)}
              >
                <img
                  src={displayedImageSrc}
                  alt={safeStr(product.name)}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />

                {/* Zoom hint overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg">
                    <FiZoomIn size={16} className="text-gray-700" />
                  </div>
                </div>

                {/* Discount badge */}
                {discount && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                    -{discount}%
                  </span>
                )}

                {/* Share button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:scale-110 transition-transform text-gray-600"
                >
                  {copied ? (
                    <FiCheck size={13} className="text-green-500" />
                  ) : (
                    <FiShare2 size={13} />
                  )}
                </button>

                {/* Favourite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite({ ...product, img: coverUrl });
                  }}
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <FiHeart
                    size={14}
                    className={liked ? "fill-red-500 text-red-500" : "text-gray-400"}
                  />
                </button>

                {/* Image indicator dots (if multiple) */}
                {allLightboxImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {allLightboxImages.map((_, i) => (
                      <span
                        key={i}
                        className={`block rounded-full transition-all ${i === currentLightboxIndex
                          ? "w-4 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/50"
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip — cover first, then gallery images */}
              {allLightboxImages.length > 1 && (
                <div
                  className="flex gap-2 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: "none" }}
                >
                  {/* Cover thumbnail */}
                  <button
                    onClick={() => setActiveImg(-1)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all group relative ${activeImg === -1
                      ? "border-black scale-105"
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200"
                      }`}
                  >
                    <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <FiZoomIn
                        size={10}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </button>

                  {/* Gallery thumbnails — click previews in big card, double-click opens lightbox */}
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveImg(i);
                      }}
                      onDoubleClick={() => {
                        setActiveImg(i);
                        openLightbox(i + 1);
                      }}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all group relative ${activeImg === i
                        ? "border-black scale-105"
                        : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200"
                        }`}
                    >
                      <img src={src} alt={`gallery ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <FiZoomIn
                          size={10}
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-gray-100">
                {[
                  { icon: <FiTruck size={14} />, label: "Free Delivery", sub: "Over $50" },
                  { icon: <FiPackage size={14} />, label: "Easy Returns", sub: "30-day policy" },
                  { icon: <FiShield size={14} />, label: "Secure Pay", sub: "256-bit SSL" },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-1">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      {icon}
                    </div>
                    <p className="text-[10px] font-black text-gray-700">{label}</p>
                    <p className="text-[9px] text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Info column ── */}
            <div className="flex-1 min-w-0">

              {catLabel && (
                <Link
                  to={`/search?q=${encodeURIComponent(catSlug)}`}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full mb-3 hover:bg-red-100 transition-colors uppercase tracking-wide"
                >
                  <HiOutlineFire size={10} /> {catLabel}
                </Link>
              )}

              <h1 className="text-xl font-black text-black mb-2 leading-tight">
                {safeStr(product.name)}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar
                      key={s}
                      size={12}
                      className={
                        s <= Math.round(rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({reviews} reviews)</span>
                {product.inStock !== false && (
                  <span className="ml-auto text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> In Stock
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-gray-100">
                <span className="text-3xl font-black text-black">${price.toFixed(2)}</span>
                {oldPrice && oldPrice > price && (
                  <span className="text-base text-gray-400 line-through">
                    ${oldPrice.toFixed(2)}
                  </span>
                )}
                {discount && (
                  <span className="text-xs font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                    Save {discount}%
                  </span>
                )}
              </div>

              {colors.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Color —{" "}
                    <span className="text-gray-900 normal-case font-bold">{activeColor}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${activeColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Size —{" "}
                    <span className="text-gray-900 normal-case font-bold">{activeSize}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 rounded-xl text-xs font-black border-2 transition-all ${activeSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Quantity
                </p>
                <div className="flex items-center gap-2 w-fit border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-10 text-center font-black text-sm tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty((v) => v + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center gap-2 font-black px-6 py-3 rounded-xl text-sm transition-all ${addedFeedback || inCart
                    ? "bg-green-500 text-white"
                    : "bg-black hover:bg-red-600 text-white"
                    }`}
                >
                  {addedFeedback || inCart ? (
                    <>
                      <FiCheck size={15} /> {inCart ? "In Cart" : "Added!"}
                    </>
                  ) : (
                    <>
                      <FiShoppingCart size={15} /> Add to Cart — ${(price * qty).toFixed(2)}
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleFavourite({ ...product, img: coverUrl })}
                  className={`flex items-center gap-2 border-2 font-black px-4 py-3 rounded-xl text-sm transition-all ${liked
                    ? "border-red-400 text-red-500 bg-red-50"
                    : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 bg-white"
                    }`}
                >
                  <FiHeart size={14} className={liked ? "fill-red-500" : ""} />
                  {liked ? "Saved" : "Save"}
                </button>

                <button
                  onClick={handleShare}
                  className="w-11 h-11 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-all bg-white"
                >
                  {copied ? (
                    <FiCheck size={14} className="text-green-500" />
                  ) : (
                    <FiShare2 size={14} />
                  )}
                </button>
              </div>

              {product.description && (
                <p className="text-sm text-gray-500 leading-relaxed mt-5 pt-5 border-t border-gray-100 line-clamp-3">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="flex gap-2 mb-5">
            {(["details", "videos"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-sm font-black transition-all ${tab === t
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {t === "details" ? "Details" : "Videos"}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <div>
              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {product.description}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Category", val: catLabel || "—" },
                  { label: "Available Sizes", val: sizes.join(", ") || "One size" },
                  { label: "Available Colors", val: colors.join(", ") || "—" },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3.5">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "videos" && (
            <div>
              {product.videos?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.videos.map((v: any) => (
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
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <HiPlay size={20} className="text-black ml-0.5" />
                        </div>
                      </div>
                      {v.duration && (
                        <span className="absolute bottom-2 right-2 text-white text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">
                          {v.duration}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <HiPlay size={24} className="text-gray-300 ml-0.5" />
                  </div>
                  <p className="text-sm font-bold text-gray-500">No videos available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        {product.related?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-black">You May Also Like</h2>
              {catSlug && (
                <Link
                  to={`/search?q=${encodeURIComponent(catSlug)}`}
                  className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
                >
                  View All <FiChevronRight size={12} />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.related.map((p: any) => (
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