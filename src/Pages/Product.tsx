import { useState } from "react";
import { FiCheck, FiChevronLeft, FiChevronRight, FiChevronRight as FiChevronRightIcon, FiHeart, FiShoppingCart, FiX } from "react-icons/fi";
import { HiPlay } from "react-icons/hi";
import { Link, useParams } from "react-router-dom";
import Footer from "../component/Footer";
import LoadingOverlay from "../component/LoadingOverlay";
import Navbar from "../component/Navbar";
import { useGetSingleProduct } from "../hooks/mutations/allMutation";
import { useShop } from "../providers/ShopContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.6ixunit.store";

const getMediaUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}/media/${path}`;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ProductSkeleton = () => (
  <div className="bg-gray-50 min-h-screen">
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        {[80, 60, 120].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />}
            <div className="h-3 bg-gray-200 rounded-full animate-pulse" style={{ width: w }} />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 shrink-0">
            <div className="rounded-xl bg-gray-200 animate-pulse mb-3" style={{ aspectRatio: "1/1" }} />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-6 w-2/3 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 w-1/4 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

// ─── Image Preview Modal ───────────────────────────────────────────────────────

const ImagePreviewModal = ({
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

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Keyboard navigation
  useState(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={handleBackdrop}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <FiX size={20} />
      </button>

      {/* Counter */}
      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-semibold">
        {current + 1} / {images.length}
      </span>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <FiChevronLeft size={22} />
        </button>
      )}

      {/* Main image */}
      <img
        src={images[current]}
        alt=""
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl select-none"
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <FiChevronRightIcon size={22} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${current === i ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Product Page ─────────────────────────────────────────────────────────────

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { product: productResponse, isLoading, isError } = useGetSingleProduct(productId);
  const product = productResponse?.data;

  const { addToCart, isInCart, toggleFavourite, isFavourite } = useShop();

  const [activeImg, setActiveImg] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null); // ← new
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"details" | "videos">("details");
  const [addedFeedback, setAddedFeedback] = useState(false);

  // ── Loading state — show overlay + skeleton ────────────────────────────────
  if (isLoading) {
    return (
      <>
        <LoadingOverlay visible={true} />
        <ProductSkeleton />
      </>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-lg">Product not found</p>
            <Link to="/" className="text-red-600 text-sm font-semibold mt-2 inline-block hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Normalise data from API ────────────────────────────────────────────────
  const name = product.name ?? "";
  const price = parseFloat(product.price) || 0;
  const oldPrice = product.old_price ? parseFloat(product.old_price) : null;
  const discount = product.discount ? Number(product.discount) : null;
  const tag = product.tag ?? null;
  const description = product.description ?? "";
  const catLabel = product.category?.label ?? product.category ?? "";
  const catSlug = product.category?.slug ?? "";

  const colors: string[] = (product.colors ?? []).map((c: any) =>
    typeof c === "string" ? c : c.name
  );
  const sizes: string[] = (product.sizes ?? []).map((s: any) =>
    typeof s === "string" ? s : s.name
  );

  const mainImage = getMediaUrl(product.img ?? "");
  const extraImages = (product.images ?? [])
    .map((img: any) => getMediaUrl(img.img ?? img))
    .filter((url: string) => url !== mainImage);
  const galleryImages: string[] = mainImage ? [mainImage, ...extraImages] : extraImages;

  const liked = isFavourite(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = () => {
    addToCart(
      { ...product, img: galleryImages[0] },
      qty,
      selectedColor || colors[0],
      selectedSize || sizes[0]
    );
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Image preview modal */}
      {previewIndex !== null && (
        <ImagePreviewModal
          images={galleryImages}
          startIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          {["Lifestyle", catLabel, name].map((label, i, arr) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <FiChevronRight size={13} className="text-gray-400" />}
              {i < arr.length - 1 ? (
                <Link
                  to={i === 0 ? "/" : `/search?q=${encodeURIComponent(catSlug)}`}
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
              {/* Main image — click to preview */}
              <div
                className="rounded-xl overflow-hidden bg-gray-50 mb-3 cursor-zoom-in"
                style={{ aspectRatio: "1/1" }}
                onClick={() => setPreviewIndex(activeImg)}
              >
                <img
                  src={galleryImages[activeImg]}
                  alt={name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      onDoubleClick={() => setPreviewIndex(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${activeImg === i
                        ? "border-red-500"
                        : "border-transparent hover:border-gray-300"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-xl font-black text-black mb-1">{name}</h1>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-black text-black">€{price.toFixed(2)}</span>
                {oldPrice && (
                  <span className="text-base text-gray-400 line-through">€{oldPrice.toFixed(2)}</span>
                )}
                {discount && (
                  <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
                {tag && !discount && (
                  <span className="bg-black text-white text-xs font-black px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                )}
              </div>

              {/* Color */}
              {colors.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    Color: <span className="font-normal text-gray-500">{selectedColor || colors[0]}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${(selectedColor || colors[0]) === color
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
              {sizes.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    Size: <span className="font-normal text-gray-500">{selectedSize || sizes[0]}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 rounded-lg text-xs font-bold border-2 transition-colors ${(selectedSize || sizes[0]) === size
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
                  className={`flex items-center gap-2 font-black px-5 py-2.5 rounded-xl text-sm transition-all duration-300 ${addedFeedback || inCart
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
                  onClick={() => toggleFavourite({ ...product, img: galleryImages[0] })}
                  className={`flex items-center gap-2 border-2 font-black px-5 py-2.5 rounded-xl text-sm transition-colors ${liked
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
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex gap-2 mb-5">
            {(["details", "videos"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-sm font-black capitalize transition-colors ${tab === t ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <div>
              <h3 className="font-black text-base text-black mb-2">Product Details</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Category", catLabel],
                  ["Available Sizes", sizes.join(", ") || "—"],
                  ["Available Colors", colors.join(", ") || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "videos" && (
            <div>
              <h3 className="font-black text-base text-black mb-3">Product Videos</h3>
              {product.videos?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.videos.map((v: any) => (
                    <div
                      key={v.id}
                      className="relative rounded-xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <img
                        src={getMediaUrl(v.thumb)}
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
      </div>

      <Footer />
    </div>
  );
};

export default Product;