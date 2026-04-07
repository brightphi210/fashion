import { useEffect, useMemo, useState } from "react";
import {
    FiChevronDown,
    FiFilter,
    FiSearch,
    FiStar,
    FiX,
} from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import ProductCard, { ProductCardSkeleton } from "../component/ProductCard";
import { useGetProducts } from "../hooks/mutations/allMutation";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortOption = "relevance" | "price-asc" | "price-desc" | "rating" | "newest";

const SORT_LABELS: Record<SortOption, string> = {
    relevance: "Most Relevant",
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
    rating: "Highest Rated",
    newest: "Newest First",
};

const PRICE_RANGES = [
    { label: "All Prices", min: 0, max: Infinity },
    { label: "Under €25", min: 0, max: 25 },
    { label: "€25 – €50", min: 25, max: 50 },
    { label: "€50 – €100", min: 50, max: 100 },
    { label: "€100 – €200", min: 100, max: 200 },
    { label: "Over €200", min: 200, max: Infinity },
];

// Safely convert ANY value (string, object, number, null) to a searchable lowercase string.
// Handles API fields like category = { id, label, slug, img } instead of a plain string.
const toStr = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val.toLowerCase();
    if (typeof val === "number") return String(val);
    if (typeof val === "object")
        return Object.values(val)
            .filter((v) => typeof v === "string")
            .join(" ")
            .toLowerCase();
    return "";
};

// ─── Search Results ───────────────────────────────────────────────────────────
const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") ?? "";
    const [localQuery, setLocalQuery] = useState(query);
    const [sortBy, setSortBy] = useState<SortOption>("relevance");
    const [priceRange, setPriceRange] = useState(0);
    const [minRating, setMinRating] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);

    const { products, isLoading } = useGetProducts();

    // Safely extract array regardless of API response shape
    const allProducts: any[] = useMemo(() => {
        const candidates = [
            products?.data?.data,
            products?.data?.results,
            products?.data,
            products,
        ];
        for (const c of candidates) {
            if (Array.isArray(c) && c.length > 0) return c;
        }
        return [];
    }, [products]);

    // Sync localQuery when URL changes
    useEffect(() => { setLocalQuery(query); }, [query]);

    // ── Filter & Sort ──
    const results = useMemo(() => {
        const range = PRICE_RANGES[priceRange];

        let filtered = allProducts.filter((p: any) => {
            // If no query, show everything (but still apply price/rating filters)
            const matchesQuery = !query.trim() || (
                toStr(p.name).includes(query.toLowerCase()) ||
                toStr(p.category).includes(query.toLowerCase()) ||
                toStr(p.description).includes(query.toLowerCase()) ||
                toStr(p.tag).includes(query.toLowerCase()) ||
                toStr(p.slug).includes(query.toLowerCase())
            );
            const price = Number(p.price) || 0;
            const matchesPrice = price >= range.min && price <= range.max;
            const matchesRating = !minRating || (Number(p.rating) || 4) >= minRating;
            return matchesQuery && matchesPrice && matchesRating;
        });

        switch (sortBy) {
            case "price-asc": filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price)); break;
            case "price-desc": filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price)); break;
            case "rating": filtered = [...filtered].sort((a, b) => (Number(b.rating) || 4) - (Number(a.rating) || 4)); break;
            case "newest": filtered = [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); break;
            default: break;
        }
        return filtered;
    }, [allProducts, query, priceRange, minRating, sortBy]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!localQuery.trim()) return;
        setSearchParams({ q: localQuery.trim() });
    };

    const clearFilter = (type: "price" | "rating") => {
        if (type === "price") setPriceRange(0);
        if (type === "rating") setMinRating(0);
    };

    const activeFilters = [
        priceRange !== 0 && { key: "price" as const, label: PRICE_RANGES[priceRange].label },
        minRating > 0 && { key: "rating" as const, label: `${minRating}★ & up` },
    ].filter(Boolean) as { key: "price" | "rating"; label: string }[];

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* ── Search bar ── */}
                <div className="mb-7">
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
                        <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 gap-2 focus-within:border-black transition-colors">
                            <FiSearch className="text-gray-400 shrink-0" size={15} />
                            <input
                                type="text"
                                value={localQuery}
                                onChange={(e) => setLocalQuery(e.target.value)}
                                placeholder="Search products..."
                                className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400 font-medium"
                                autoFocus
                            />
                            {localQuery && (
                                <button type="button" onClick={() => { setLocalQuery(""); setSearchParams({}); }}
                                    className="text-gray-300 hover:text-gray-500 transition-colors">
                                    <FiX size={13} />
                                </button>
                            )}
                        </div>
                        <button type="submit"
                            className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-red-600 transition-colors whitespace-nowrap">
                            Search
                        </button>
                    </form>

                    {query && (
                        <p className="text-sm text-gray-500 mt-3">
                            {isLoading
                                ? <span className="inline-block h-4 w-48 bg-gray-200 rounded animate-pulse" />
                                : <><span className="font-black text-gray-900">{results.length}</span> result{results.length !== 1 ? "s" : ""} for <span className="font-black text-black">"{query}"</span></>
                            }
                        </p>
                    )}
                </div>

                {/* ── Toolbar ── */}
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className={`flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-xl border transition-all ${showFilters || activeFilters.length > 0
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-200 hover:border-black"
                            }`}
                    >
                        <FiFilter size={13} />
                        Filters
                        {activeFilters.length > 0 && (
                            <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black">
                                {activeFilters.length}
                            </span>
                        )}
                    </button>

                    {activeFilters.map((f) => (
                        <button key={f.key} onClick={() => clearFilter(f.key)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                            {f.label} <FiX size={11} />
                        </button>
                    ))}

                    <div className="flex-1" />

                    {/* Sort */}
                    <div className="relative">
                        <button onClick={() => setSortOpen((v) => !v)}
                            className="flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-black transition-colors">
                            {SORT_LABELS[sortBy]}
                            <FiChevronDown size={13} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                        </button>
                        {sortOpen && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-30 overflow-hidden">
                                {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                                    <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${sortBy === opt ? "bg-black text-white font-black" : "text-gray-700 hover:bg-gray-50"
                                            }`}>
                                        {SORT_LABELS[opt]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Filters panel ── */}
                {showFilters && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3">Price Range</p>
                            <div className="flex flex-wrap gap-2">
                                {PRICE_RANGES.map((range, idx) => (
                                    <button key={idx} onClick={() => setPriceRange(idx)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${priceRange === idx
                                            ? "bg-black text-white border-black"
                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-black"
                                            }`}>
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3">Minimum Rating</p>
                            <div className="flex gap-2 flex-wrap">
                                {[0, 3, 3.5, 4, 4.5].map((r) => (
                                    <button key={r} onClick={() => setMinRating(r)}
                                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border transition-all ${minRating === r
                                            ? "bg-black text-white border-black"
                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-black"
                                            }`}>
                                        {r === 0 ? "Any" : <><FiStar size={10} className="fill-amber-400 text-amber-400" />{r}+</>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Results grid ── */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <HiOutlineFire className="text-red-500" size={20} />
                            <h2 className="text-base font-black text-black">
                                {query ? "Search Results" : "All Products"}
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {results.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center py-24 text-center px-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <FiSearch size={28} className="text-gray-300" />
                        </div>
                        <h2 className="text-base font-black text-gray-800 mb-2">
                            {query ? `No results for "${query}"` : "No products found"}
                        </h2>
                        <p className="text-sm text-gray-400 mb-6 max-w-xs">
                            Try different keywords, check your spelling, or browse by category.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {["Clothing", "Shoes", "Accessories", "Sale"].map((s) => (
                                <button key={s}
                                    onClick={() => { setLocalQuery(s); setSearchParams({ q: s }); }}
                                    className="text-sm font-bold px-4 py-2 bg-gray-100 hover:bg-black hover:text-white text-gray-700 rounded-xl transition-colors">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default SearchResults;