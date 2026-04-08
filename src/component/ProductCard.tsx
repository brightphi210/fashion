import { useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useShop } from "../providers/ShopContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.6ixunit.store";

const getMediaUrl = (path: string) => {
    if (!path) return "";
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

export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
        <div className="bg-gray-200" style={{ aspectRatio: "1/1" }} />
        <div className="p-3.5 space-y-2.5">
            <div className="h-3 w-3/4 bg-gray-200 rounded-full" />
            <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
            <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-16 bg-gray-200 rounded-full" />
                <div className="h-8 w-24 bg-gray-200 rounded-xl" />
            </div>
        </div>
    </div>
);

interface ProductCardProps {
    product: any;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart, isInCart, toggleFavourite, isFavourite } = useShop();
    const [addedId, setAddedId] = useState<number | null>(null);

    const name = safeStr(product.name);
    const imgSrc = getMediaUrl(product.img ?? product.image ?? "");
    const price = parseFloat(product.price) || 0;
    const oldPrice = product.old_price ? parseFloat(product.old_price) : null;
    const discount = product.discount ? Number(product.discount) : null;
    const tag = product.tag ?? null;
    const badgeLabel = tag ?? (discount ? `-${discount}%` : null);

    const inCart = isInCart(product.id);
    const liked = isFavourite(product.id);
    const isAdded = addedId === product.id;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inCart) return;
        addToCart({ ...product, img: imgSrc });
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 2000);
        toast.success("Added to cart!");
    };

    const handleToggleFavourite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const wasLiked = liked;
        toggleFavourite({ ...product, img: imgSrc });
        if (wasLiked) {
            toast.info("Removed from favourites");
        } else {
            toast.success("Saved to favourites!");
        }
    };

    return (
        <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">

            {/* ── Image ── */}
            <Link
                to={`/product/${product.id}`}
                className="block relative overflow-hidden bg-gray-50"
                style={{ aspectRatio: "1/1" }}
            >
                <img
                    src={imgSrc}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge — tag or discount label */}
                {badgeLabel && (
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wide uppercase">
                        {badgeLabel}
                    </span>
                )}

                {/* Favourite button */}
                <button
                    onClick={handleToggleFavourite}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-all hover:scale-110"
                >
                    <FiHeart
                        size={14}
                        className={liked ? "fill-red-500 text-red-500" : "text-gray-400"}
                    />
                </button>
            </Link>

            {/* ── Card Body ── */}
            <div className="py-3 px-2">
                <Link to={`/product/${product.id}`}>
                    <p
                        className="text-sm font-bold text-gray-900 truncate hover:text-red-600 transition-colors mb-0.5"
                        style={{ letterSpacing: "-0.01em" }}
                    >
                        {name}
                    </p>
                </Link>

                {product.colors?.length > 0 && (
                    <p className="text-[11px] text-gray-400 truncate mb-2">
                        {product.colors
                            .slice(0, 3)
                            .map((c: any) => safeStr(c))
                            .join(" · ")}
                        {product.colors.length > 3 && (
                            <span className="text-gray-300"> +{product.colors.length - 3}</span>
                        )}
                    </p>
                )}

                {/* ── Price row + Cart button ── */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-black">€{price.toFixed(2)}</span>
                        {oldPrice && (
                            <span className="text-[10px] text-gray-300 line-through">€{oldPrice.toFixed(2)}</span>
                        )}
                    </div>
                    <p className="text-[10px] bg-gray-100 my-1  lg:p-1 rounded-sm">-{Math.round(product.discount)}%</p>
                </div>

                <div>
                    <button
                        onClick={handleAddToCart}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs w-full justify-center mt-2 font-medium shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 ${isAdded
                            ? "bg-green-600 text-white"
                            : inCart
                                ? "bg-green-600 text-white"
                                : "bg-black text-white hover:bg-neutral-800"
                            }`}
                        title={isAdded ? "Added!" : inCart ? "In Cart" : "Add to Cart"}
                    >
                        <FiShoppingCart size={13} />
                        {isAdded ? "Added!" : inCart ? "In Cart" : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;