import { FiHeart } from "react-icons/fi";
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
    <div className="rounded-xl overflow-hidden animate-pulse">
        <div className="bg-[rgba(201,185,154,0.1)] aspect-square" />
        <div className="p-3 space-y-2">
            <div className="h-3 w-3/4 bg-[rgba(201,185,154,0.1)] rounded-full" />
            <div className="h-3 w-1/2 bg-[rgba(201,185,154,0.1)] rounded-full" />
            <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-16 bg-[rgba(201,185,154,0.1)] rounded-full" />
                <div className="h-8 w-24 bg-[rgba(201,185,154,0.1)] rounded-xl" />
            </div>
        </div>
    </div>
);

interface ProductCardProps {
    product: any;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { toggleFavourite, isFavourite } = useShop();

    const name = safeStr(product.name);
    const imgSrc = getMediaUrl(product.img ?? product.image ?? "");
    const price = parseFloat(product.price) || 0;
    const oldPrice = product.old_price ? parseFloat(product.old_price) : null;
    const discount = product.discount ? Number(product.discount) : null;
    const tag = product.tag ?? null;
    const badgeLabel = tag ?? (discount ? `-${discount}%` : null);

    const liked = isFavourite(product.id);

    console.log('This is Product:', product);

    // const handleAddToCart = (e: React.MouseEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if (inCart) return;
    //     addToCart({ ...product, img: imgSrc });
    //     setAddedId(product.id);
    //     setTimeout(() => setAddedId(null), 2000);
    //     toast.success("Added to cart!");
    // };

    const handleToggleFavourite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const wasLiked = liked;
        toggleFavourite({ ...product, img: imgSrc });
        toast[wasLiked ? "info" : "success"](
            wasLiked ? "Removed from favourites" : "Saved to favourites!"
        );
    };

    return (
        <div className="group overflow-hidden transition-all duration-300">

            {/* Image */}
            <Link
                to={`/product/${product.id}`}
                className="block relative overflow-hidden aspect-square"
            >
                <img
                    src={imgSrc}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Bottom gradient */}
                <div className="absolute inset-0 pointer-events-none" />

                {/* Badge */}
                {badgeLabel && (
                    <span className="absolute top-2.5 left-2.5 bg-[#c9b99a]/55 text-[#28251e] text-[10px] font-bold px-2 py-0.5 tracking-widest">
                        {badgeLabel}
                    </span>
                )}

                {/* Favourite button */}
                <button
                    onClick={handleToggleFavourite}
                    className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                >
                    <FiHeart
                        size={13}
                        className={liked ? "fill-[#c9b99a]/55 text-[#c9b99a]/55" : "text-gray-300"}
                    />
                </button>
            </Link>

            {/* Card Body */}
            <div className="py-3 px-1 text-[#c9b99a]/55 text-center">
                <Link to={`/product/${product.id}`}>
                    <p className="text-xs font-bold text-[#c9b99a]/55 mb-0.5 uppercase tracking-wide">
                        {name}
                    </p>
                </Link>

                {product.colors?.length > 0 && (
                    <p className="text-xs truncate uppercase mb-2 pt-2 text-[#c9b99a]/55">
                        [ {product.colors[0]?.name} ]
                    </p>
                )}

                {/* Price row */}
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs font-black">€{price.toFixed(2)}</span>
                    {oldPrice && (
                        <span className="text-[12px] opacity-40 line-through">€{oldPrice.toFixed(2)}</span>
                    )}
                    {/* {discount && (
                        <span className="text-[10px] font-bold opacity-60 tracking-wide">
                            -{Math.round(discount)}%
                        </span>
                    )} */}
                </div>

                {/* Cart button */}
                {/* <button
                    onClick={handleAddToCart}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-none text-xs w-full justify-center font-bold tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 ${isAdded || inCart
                        ? "bg-[#c9b99a]/55 text-[#28251e]"
                        : "bg-white/10 hover:bg-white/20 text-[#c9b99a]/55"
                        }`}
                >
                    <FiShoppingCart size={13} />
                    {isAdded ? "Added!" : inCart ? "In Cart" : "Add to Cart"}
                </button> */}
            </div>
        </div>
    );
};

export default ProductCard;