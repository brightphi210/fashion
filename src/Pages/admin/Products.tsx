import { useState } from "react";
import {
    FiEdit2, FiEye, FiPlus, FiSearch,
    FiShoppingBag, FiTag, FiTrash2, FiX
} from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";
import AddProductModal from "../../component/AddProductModal";
import EditProductTextModal from "../../component/EditProductModal";
import { useDeleteProduct, useGetProducts } from "../../hooks/mutations/allMutation";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://api.6ixunit.store";
// const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const getMediaUrl = (path: any) => {
    if (!path || typeof path !== "string") return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}/media/${path}`;
};
const safeStr = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") return String(val.label ?? val.name ?? val.title ?? val.slug ?? "");
    return String(val);
};

// ─── Product Detail Modal ─────────────────────────────────────────────────────
const ProductDetailModal = ({
    product, onClose, onEdit,
}: { product: any; onClose: () => void; onEdit: () => void }) => {
    const price = parseFloat(product.price) || 0;
    const oldPrice = product.old_price ? parseFloat(product.old_price) : null;
    const discount = product.discount ? Number(product.discount) : null;
    const colors: string[] = product.colors?.map((c: any) => safeStr(c)) ?? [];
    const sizes: string[] = product.sizes?.map((s: any) => safeStr(s)) ?? [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-base font-black text-gray-900">Product Details</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={onEdit}
                            className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                            <FiEdit2 size={11} /> Edit
                        </button>
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <FiX size={14} />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 relative">
                        <img src={getMediaUrl(product.img ?? product.image ?? "")}
                            alt={safeStr(product.name)} className="w-full h-full object-cover" />
                        {discount && (
                            <span className="absolute top-3 left-3 text-xs font-black text-white bg-red-500 px-2.5 py-1 rounded-lg">
                                -{discount}%
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">{safeStr(product.name)}</h3>
                        {product.description && (
                            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Price", val: `€${price.toFixed(2)}` },
                            { label: "Old Price", val: oldPrice ? `€${oldPrice.toFixed(2)}` : "—" },
                            { label: "Category", val: safeStr(product.category) || "—" },
                            { label: "Tag", val: safeStr(product.tag) || "—" },
                            { label: "Status", val: product.is_available ? "Available" : "Unavailable" },
                            { label: "Discount", val: discount ? `${discount}%` : "—" },
                        ].map(({ label, val }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">{label}</p>
                                <p className="text-sm font-bold text-gray-800">{val}</p>
                            </div>
                        ))}
                    </div>
                    {sizes.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sizes</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {sizes.map(s => (
                                    <span key={s} className="px-2.5 py-1 text-xs font-black border-2 border-gray-200 rounded-xl text-gray-700">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {colors.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Colors</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {colors.map(c => (
                                    <span key={c} className="px-2.5 py-1 text-xs font-black bg-gray-100 border border-gray-200 rounded-full text-gray-700">{c}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ product, onClose, onConfirm, loading }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <FiTrash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-black text-gray-900 text-center mb-1">Delete Product?</h3>
            <p className="text-sm text-gray-400 text-center mb-5">
                "<span className="font-bold text-gray-600">{safeStr(product?.name)}</span>" will be permanently removed.
            </p>
            <div className="flex gap-3">
                <button onClick={onClose}
                    className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={loading}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-60">
                    {loading ? "Deleting…" : "Delete"}
                </button>
            </div>
        </div>
    </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({
    product, onView, onEdit, onDelete,
}: { product: any; onView: () => void; onEdit: () => void; onDelete: () => void }) => {
    const price = parseFloat(product.price) || 0;
    const oldPrice = product.old_price ? parseFloat(product.old_price) : null;
    const discount = product.discount ? Number(product.discount) : null;
    const catLabel = safeStr(product.category);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group flex flex-col">
            <div className="aspect-square bg-gray-50 overflow-hidden relative">
                <img src={getMediaUrl(product.img ?? product.image ?? "")} alt={safeStr(product.name)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {discount && (
                    <span className="absolute top-2.5 left-2.5 text-[9px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-md uppercase">
                        -{discount}%
                    </span>
                )}
                {product.tag && (
                    <span className="absolute top-2.5 right-2.5 flex items-center gap-0.5 text-[9px] font-black text-gray-600 bg-white/90 border border-gray-200 px-1.5 py-0.5 rounded-md">
                        <FiTag size={8} />{product.tag}
                    </span>
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={onView}
                        className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow">
                        <FiEye size={14} />
                    </button>
                    <button onClick={onEdit}
                        className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow">
                        <FiEdit2 size={14} />
                    </button>
                    <button onClick={onDelete}
                        className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>
            <div className="p-3.5 flex flex-col flex-1">
                {catLabel && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full mb-1.5 w-fit uppercase tracking-wide">
                        <HiOutlineFire size={8} />{catLabel}
                    </span>
                )}
                <p className="text-xs font-black text-gray-800 line-clamp-2 leading-tight flex-1">{safeStr(product.name)}</p>
                <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-gray-900">€{price.toFixed(2)}</span>
                        {oldPrice && <span className="text-[10px] text-gray-300 line-through">€{oldPrice.toFixed(2)}</span>}
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${product.is_available
                        ? "text-green-600 bg-green-50 border-green-200"
                        : "text-gray-400 bg-gray-50 border-gray-200"}`}>
                        {product.is_available ? "Active" : "Off"}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─── Main Products Page ───────────────────────────────────────────────────────
const Products = () => {
    const { products, isLoading } = useGetProducts();
    const deleteProduct = useDeleteProduct();

    const allProducts: any[] = Array.isArray(products?.data) ? products.data : [];

    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<any | null>(null);
    const [viewTarget, setViewTarget] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

    const filtered = allProducts.filter(p =>
        safeStr(p.name).toLowerCase().includes(search.toLowerCase()) ||
        safeStr(p.category).toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteProduct.mutateAsync(deleteTarget.id);
        setDeleteTarget(null);
    };

    // Open edit — close detail view first if open
    const openEdit = (product: any) => {
        setViewTarget(null);
        setEditTarget(product);
    };

    return (
        <div className="p-6 max-w-6xl">

            {/* Add Modal */}
            {showAdd && (
                <AddProductModal onClose={() => setShowAdd(false)} />
            )}

            {/* Edit Modal */}
            {editTarget && (
                <EditProductTextModal
                    product={editTarget}
                    onClose={() => setEditTarget(null)}
                />
            )}

            {/* Detail Modal */}
            {viewTarget && !editTarget && (
                <ProductDetailModal
                    product={viewTarget}
                    onClose={() => setViewTarget(null)}
                    onEdit={() => openEdit(viewTarget)}
                />
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteModal
                    product={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    loading={deleteProduct.isPending}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Products</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{allProducts.length} products in your store</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-colors">
                    <FiPlus size={15} /> Add Product
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <FiSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or category…"
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 bg-white" />
                {search && (
                    <button onClick={() => setSearch("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <FiX size={14} />
                    </button>
                )}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                            <div className="aspect-square bg-gray-100" />
                            <div className="p-3.5 space-y-2">
                                <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                                <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                                <div className="flex justify-between">
                                    <div className="h-4 w-16 bg-gray-100 rounded-full" />
                                    <div className="h-4 w-12 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                    <FiShoppingBag size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400 mb-1">No products found</p>
                    {search
                        ? <button onClick={() => setSearch("")} className="text-xs font-black text-black underline underline-offset-2">Clear search</button>
                        : <button onClick={() => setShowAdd(true)} className="text-xs font-black text-black underline underline-offset-2">Add your first product</button>
                    }
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filtered.map(p => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            onView={() => setViewTarget(p)}
                            onEdit={() => openEdit(p)}
                            onDelete={() => setDeleteTarget(p)}
                        />
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-300 text-center mt-5">
                Showing {filtered.length} of {allProducts.length} products
            </p>
        </div>
    );
};

export default Products;