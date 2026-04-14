import { useState } from "react";
import { FiCheck, FiChevronLeft, FiChevronRight, FiChevronRight as FiChevronRightIcon, FiHeart, FiShoppingCart, FiX } from "react-icons/fi";
import { HiPlay } from "react-icons/hi";
import { Link, useParams } from "react-router-dom";
import camo from "../assets/camo.jpg";
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
  <div className="min-h-screen relative" style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}>
    <div className="fixed inset-0 z-0 pointer-events-none bg-black/70" />
    <div className="relative z-10">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          {[80, 60, 120].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <div className="w-3 h-3 bg-[rgba(201,185,154,0.15)] rounded animate-pulse" />}
              <div className="h-3 bg-[rgba(201,185,154,0.15)] rounded-full animate-pulse" style={{ width: w }} />
            </div>
          ))}
        </div>
        <div className="bg-[rgba(201,185,154,0.06)] border border-[rgba(201,185,154,0.12)] p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 shrink-0">
              <div className="bg-[rgba(201,185,154,0.1)] animate-pulse mb-3" style={{ aspectRatio: "1/1" }} />
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-16 h-16 bg-[rgba(201,185,154,0.1)] animate-pulse" />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-6 w-2/3 bg-[rgba(201,185,154,0.1)] rounded-full animate-pulse" />
              <div className="h-8 w-1/4 bg-[rgba(201,185,154,0.1)] rounded-full animate-pulse" />
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-8 w-16 bg-[rgba(201,185,154,0.1)] animate-pulse" />
                ))}
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 bg-[rgba(201,185,154,0.1)] animate-pulse" />
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-36 bg-[rgba(201,185,154,0.1)] animate-pulse" />
                <div className="h-10 w-36 bg-[rgba(201,185,154,0.1)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
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

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-[#c9b99a] bg-[rgba(201,185,154,0.1)] hover:bg-[rgba(201,185,154,0.2)] transition-colors"
      >
        <FiX size={20} />
      </button>

      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[rgba(201,185,154,0.5)] text-sm font-semibold tracking-widest">
        {current + 1} / {images.length}
      </span>

      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 w-10 h-10 flex items-center justify-center text-[#c9b99a] bg-[rgba(201,185,154,0.1)] hover:bg-[rgba(201,185,154,0.2)] transition-colors"
        >
          <FiChevronLeft size={22} />
        </button>
      )}

      <img
        src={images[current]}
        alt=""
        className="max-h-[85vh] max-w-[90vw] object-contain select-none"
      />

      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 w-10 h-10 flex items-center justify-center text-[#c9b99a] bg-[rgba(201,185,154,0.1)] hover:bg-[rgba(201,185,154,0.2)] transition-colors"
        >
          <FiChevronRightIcon size={22} />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-12 h-12 overflow-hidden border-2 transition-colors shrink-0 ${current === i
                ? "border-[#c9b99a]"
                : "border-transparent opacity-40 hover:opacity-70"
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

  console.log("Product data:", product); // Debug log to check product data structure

  const { addToCart, isInCart, toggleFavourite, isFavourite } = useShop();

  const [activeImg, setActiveImg] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"details" | "videos">("details");
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (isLoading) {
    return (
      <>
        <LoadingOverlay visible={true} />
        <ProductSkeleton />
      </>
    );
  }

  if (isError || !product) {
    return (
      <div
        className="min-h-screen relative"
        style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
      >
        <div className="fixed inset-0 z-0 pointer-events-none bg-black/70" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-[rgba(201,185,154,0.4)]">
            <div className="text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-bold text-lg text-[#c9b99a]">Product not found</p>
              <Link to="/" className="text-[rgba(201,185,154,0.6)] text-sm font-semibold mt-2 inline-block hover:text-[#c9b99a] tracking-widest">
                ← Back to Home
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

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
    <div
      className="min-h-screen relative"
      style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/70" />

      <div className="relative z-10">
        <Navbar />

        {previewIndex !== null && (
          <ImagePreviewModal
            images={galleryImages}
            startIndex={previewIndex}
            onClose={() => setPreviewIndex(null)}
          />
        )}

        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[rgba(201,185,154,0.45)] mb-6 tracking-wide">
            {["Lifestyle", name].map((label, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <FiChevronRight size={12} className="text-[rgba(201,185,154,0.25)]" />}
                {i < arr.length - 1 ? (
                  <Link
                    to={i === 0 ? "/" : `/search?q=${encodeURIComponent(catSlug)}`}
                    className="hover:text-[#c9b99a] transition-colors"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="font-bold text-[#c9b99a] truncate max-w-40">{label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* ── Top Section ── */}
          <div className="bg-[rgba(201,185,154,0.05)] border border-[rgba(201,185,154,0.12)] lg:p-5 p-3 mb-6">
            <div className="flex flex-col md:flex-row gap-6">

              {/* Images */}
              <div className="md:w-64 shrink-0">
                <div
                  className="overflow-hidden mb-3 cursor-zoom-in"
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
                        className={`w-16 h-16 overflow-hidden border-2 transition-colors shrink-0 ${activeImg === i
                          ? "border-[#c9b99a]"
                          : "border-transparent opacity-40 hover:opacity-70 hover:border-[rgba(201,185,154,0.4)]"
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
                <h1 className="text-sm font-black text-[#c9b99a] tracking-widest uppercase mb-2">{name}</h1>

                {/* Price */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg font-black text-[#c9b99a]">€{price.toFixed(2)}</span>
                  {oldPrice && (
                    <span className="text-sm text-[rgba(201,185,154,0.35)] line-through">€{oldPrice.toFixed(2)}</span>
                  )}
                  {discount && (
                    <span className="bg-[#c9b99a] text-[#28251e] text-[10px] font-black px-2 py-0.5 tracking-widest">
                      -{discount}%
                    </span>
                  )}
                  {tag && !discount && (
                    <span className="bg-[#c9b99a] text-[#28251e] text-[10px] font-black px-2 py-0.5 tracking-widest">
                      {tag}
                    </span>
                  )}
                </div>

                {/* Color */}
                {colors.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[11px] text-[rgba(201,185,154,0.45)] mb-2 tracking-widest uppercase">
                      Color: <span className="text-[#c9b99a]">{selectedColor || colors[0]}</span>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors ${(selectedColor || colors[0]) === color
                            ? "bg-[#c9b99a] text-[#28251e]"
                            : "border border-[rgba(201,185,154,0.2)] text-[rgba(201,185,154,0.5)] hover:border-[rgba(201,185,154,0.5)] hover:text-[#c9b99a]"
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
                  <div className="mb-5">
                    <p className="text-[11px] text-[rgba(201,185,154,0.45)] mb-2 tracking-widest uppercase">
                      Size: <span className="text-[#c9b99a]">{selectedSize || sizes[0]}</span>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-10 h-8 text-xs font-bold tracking-widest transition-colors ${(selectedSize || sizes[0]) === size
                            ? "bg-[#c9b99a] text-[#28251e]"
                            : "border border-[rgba(201,185,154,0.2)] text-[rgba(201,185,154,0.5)] hover:border-[rgba(201,185,154,0.5)] hover:text-[#c9b99a]"
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <p className="text-[11px] text-[rgba(201,185,154,0.45)] mb-2 tracking-widest uppercase">Quantity:</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty((v) => Math.max(1, v - 1))}
                      className="w-8 h-8 border border-[rgba(201,185,154,0.2)] flex items-center justify-center text-[#c9b99a] hover:border-[#c9b99a] transition-colors font-bold text-base"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-black text-sm text-[#c9b99a]">{qty}</span>
                    <button
                      onClick={() => setQty((v) => v + 1)}
                      className="w-8 h-8 border border-[rgba(201,185,154,0.2)] flex items-center justify-center text-[#c9b99a] hover:border-[#c9b99a] transition-colors font-bold text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleAddToCart}
                    className={`flex items-center gap-2 font-black px-5 py-2.5 text-[10px] tracking-widest uppercase transition-all duration-300 ${addedFeedback || inCart
                      ? "bg-[#6a604a] text-white"
                      : "bg-[#c9b99a] text-[#28251e] hover:opacity-80"
                      }`}
                  >
                    {addedFeedback || inCart ? (
                      <><FiCheck size={14} /> {inCart ? "In Cart" : "Added!"}</>
                    ) : (
                      <><FiShoppingCart size={12} /> Add to Cart</>
                    )}
                  </button>
                  <button
                    onClick={() => toggleFavourite({ ...product, img: galleryImages[0] })}
                    className={`flex items-center gap-2 border font-black px-5 py-2.5 text-xs tracking-widest uppercase transition-colors ${liked
                      ? "border-[#c9b99a] text-[#c9b99a] bg-[rgba(201,185,154,0.1)]"
                      : "border-[rgba(201,185,154,0.25)] text-[rgba(201,185,154,0.6)] hover:border-[#c9b99a] hover:text-[#c9b99a]"
                      }`}
                  >
                    <FiHeart size={14} className={liked ? "fill-[#c9b99a]" : ""} />
                    {liked ? "Favourited" : "Favourite"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="bg-[rgba(201,185,154,0.05)] border border-[rgba(201,185,154,0.12)] p-5">
            <div className="flex gap-2 mb-6">
              {(["details", "videos"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 text-xs font-black tracking-widest uppercase transition-colors ${tab === t
                    ? "bg-[#c9b99a] text-[#28251e]"
                    : "bg-transparent text-[rgba(201,185,154,0.4)] border border-[rgba(201,185,154,0.15)] hover:text-[#c9b99a] hover:border-[rgba(201,185,154,0.4)]"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {tab === "details" && (
              <div>
                <h3 className="font-black text-sm text-[#c9b99a] tracking-widest uppercase mb-3">Product Details</h3>
                <p className="text-xs text-[rgba(201,185,154,0.6)] leading-relaxed">{description}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ["Category", catLabel],
                    ["Available Sizes", sizes.join(", ") || "—"],
                    ["Available Colors", colors.join(", ") || "—"],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-[rgba(201,185,154,0.06)] border border-[rgba(201,185,154,0.1)] p-3">
                      <p className="text-[10px] text-[rgba(201,185,154,0.4)] mb-1 tracking-widest uppercase">{label}</p>
                      <p className="text-xs font-semibold text-[#c9b99a]">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "videos" && (
              <div>
                <h3 className="font-black text-sm text-[#c9b99a] tracking-widest uppercase mb-4">Product Videos</h3>
                {product.videos?.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.videos.map((v: any) => (
                      <div
                        key={v.id}
                        className="relative overflow-hidden cursor-pointer group"
                        style={{ aspectRatio: "16/9" }}
                      >
                        <img
                          src={getMediaUrl(v.thumb)}
                          alt="video"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/55 transition-colors">
                          <div className="w-10 h-10 bg-[rgba(201,185,154,0.9)] flex items-center justify-center">
                            <HiPlay size={20} className="text-[#28251e] ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1.5 right-2 text-[#c9b99a] text-xs font-bold bg-black/60 px-1.5 py-0.5">
                          {v.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[rgba(201,185,154,0.3)]">
                    <p className="text-3xl mb-2">🎬</p>
                    <p className="text-sm font-semibold tracking-widest">No videos available</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Product;