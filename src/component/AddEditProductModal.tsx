import { useEffect, useRef, useState } from "react";
import {
    FiCheck, FiChevronDown, FiImage, FiPlus,
    FiTrash2,
    FiUploadCloud,
    FiX,
} from "react-icons/fi";
import { useCreateProduct, useGetCategories, useUpdateProduct } from "../hooks/mutations/allMutation";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
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

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40", "One Size"];

interface Props { onClose: () => void; editProduct?: any; }

const AddEditProductModal = ({ onClose, editProduct }: Props) => {
    const { categories } = useGetCategories();
    const allCats: any[] = Array.isArray(categories?.data) ? categories.data : [];
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const mainImgRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const isEdit = !!editProduct;

    const [form, setForm] = useState({ name: "", price: "", old_price: "", discount: "", description: "", tag: "", category: "" });
    const [isAvailable, setIsAvailable] = useState(true); // ← NEW
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [customSize, setCustomSize] = useState("");
    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState("");
    const [mainImgFile, setMainImgFile] = useState<File | null>(null);
    const [mainImgPreview, setMainImgPreview] = useState("");
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!editProduct) return;
        setForm({
            name: safeStr(editProduct.name), price: String(editProduct.price ?? ""),
            old_price: String(editProduct.old_price ?? ""), discount: String(editProduct.discount ?? ""),
            description: safeStr(editProduct.description), tag: safeStr(editProduct.tag),
            category: String(editProduct.category?.id ?? editProduct.category ?? ""),
        });
        setIsAvailable(editProduct.is_available ?? true); // ← NEW
        setSelectedSizes(editProduct.sizes?.map((s: any) => safeStr(s)) ?? []);
        setColors(editProduct.colors?.map((c: any) => safeStr(c)) ?? []);
        if (editProduct.img) setMainImgPreview(getMediaUrl(editProduct.img));
    }, [editProduct]);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const toggleSize = (s: string) => setSelectedSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
    const addCustomSize = () => { const s = customSize.trim(); if (s && !selectedSizes.includes(s)) setSelectedSizes(p => [...p, s]); setCustomSize(""); };
    const addColor = () => { const c = colorInput.trim(); if (c && !colors.includes(c)) setColors(p => [...p, c]); setColorInput(""); };

    const handleMainImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        setMainImgFile(f); setMainImgPreview(URL.createObjectURL(f));
    };
    const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        setGalleryFiles(p => [...p, ...files]);
        setGalleryPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
    };
    const removeGallery = (i: number) => {
        setGalleryFiles(p => p.filter((_, idx) => idx !== i));
        setGalleryPreviews(p => p.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price || !form.category) { setError("Name, price, and category are required."); return; }
        setError("");
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("price", form.price);
        fd.append("category", form.category);
        fd.append("is_available", String(isAvailable)); // ← NEW
        if (form.old_price) fd.append("old_price", form.old_price);
        if (form.discount) fd.append("discount", form.discount);
        if (form.description) fd.append("description", form.description);
        if (form.tag) fd.append("tag", form.tag);
        selectedSizes.forEach(s => fd.append("sizes", s));
        colors.forEach(c => fd.append("colors", c));
        if (mainImgFile) fd.append("img", mainImgFile);
        galleryFiles.forEach((f, i) => fd.append(`images[${i}]`, f));
        try {
            if (isEdit) await updateProduct.mutateAsync({ id: editProduct.id, data: fd });
            else await createProduct.mutateAsync(fd);
            setSuccess(true);
            setTimeout(() => onClose(), 900);
        } catch (e: any) {
            setError(typeof e === "object" ? Object.values(e).flat().join(", ") : "Something went wrong.");
        }
    };

    const isPending = createProduct.isPending || updateProduct.isPending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-base font-black text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h2>
                        <p className="text-xs text-gray-400">{isEdit ? "Update product details" : "Fill in the details below"}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <FiX size={14} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Main Image */}
                    <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Main Image</p>
                        <button onClick={() => mainImgRef.current?.click()}
                            className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 relative overflow-hidden flex flex-col items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-all group">
                            {mainImgPreview ? (
                                <>
                                    <img src={mainImgPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-black bg-black/60 px-3 py-1.5 rounded-lg">Change Image</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FiUploadCloud size={28} className="text-gray-300" />
                                    <p className="text-xs text-gray-400 font-medium">Click to upload main product image</p>
                                    <p className="text-[10px] text-gray-300">PNG, JPG, WEBP — recommended 800×800</p>
                                </>
                            )}
                        </button>
                        <input ref={mainImgRef} type="file" accept="image/*" className="hidden" onChange={handleMainImg} />
                    </div>

                    {/* Gallery Images */}
                    <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Gallery Images <span className="normal-case font-normal text-gray-300">(optional)</span></p>
                        <div className="flex gap-2 flex-wrap">
                            {galleryPreviews.map((src, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 group shrink-0">
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => removeGallery(i)}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiTrash2 size={14} className="text-white" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => galleryRef.current?.click()}
                                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-300 hover:text-gray-500 shrink-0">
                                <FiImage size={18} /><span className="text-[9px] font-bold">Add</span>
                            </button>
                        </div>
                        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">Product Name *</label>
                        <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Premium Cotton T-Shirt"
                            className="w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300" />
                    </div>

                    {/* Price row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[{ k: "price", label: "Price *", ph: "0.00" }, { k: "old_price", label: "Old Price", ph: "0.00" }, { k: "discount", label: "Discount (%)", ph: "0" }].map(({ k, label, ph }) => (
                            <div key={k}>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">{label}</label>
                                <input type="number" value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                                    className="w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300" />
                            </div>
                        ))}
                    </div>

                    {/* Category + Tag */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">Category *</label>
                            <div className="relative">
                                <select value={form.category} onChange={e => set("category", e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-black transition-colors appearance-none bg-white">
                                    <option value="">Select category</option>
                                    {allCats.map((cat: any) => <option key={cat.id} value={cat.id}>{safeStr(cat.label ?? cat.name)}</option>)}
                                </select>
                                <FiChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">Tag <span className="normal-case font-normal text-gray-300">(optional)</span></label>
                            <input value={form.tag} onChange={e => set("tag", e.target.value)} placeholder="New, Sale, Hot…"
                                className="w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300" />
                        </div>
                    </div>

                    {/* ── Availability Toggle ── NEW SECTION */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">
                            Availability
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsAvailable(p => !p)}
                            className={`relative inline-flex items-center gap-3 w-full border-2 rounded-xl px-4 py-3 transition-all ${isAvailable
                                ? "border-green-200 bg-green-50 hover:border-green-300"
                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                }`}
                        >
                            {/* Toggle pill */}
                            <div className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${isAvailable ? "bg-green-500" : "bg-gray-300"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isAvailable ? "translate-x-5" : "translate-x-0"}`} />
                            </div>
                            {/* Label */}
                            <div className="text-left">
                                <p className={`text-xs font-black ${isAvailable ? "text-green-700" : "text-gray-500"}`}>
                                    {isAvailable ? "Available for purchase" : "Hidden from store"}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {isAvailable ? "Product is visible and can be ordered" : "Product won't appear in the store"}
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* Sizes */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">
                            Sizes <span className="normal-case font-normal text-gray-300">— tap to toggle</span>
                        </label>
                        <div className="flex gap-2 flex-wrap mb-3">
                            {PRESET_SIZES.map(s => (
                                <button key={s} type="button" onClick={() => toggleSize(s)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all select-none ${selectedSizes.includes(s) ? "border-black bg-black text-white" : "border-gray-200 text-gray-500 hover:border-gray-400 bg-white"
                                        }`}>
                                    {s}
                                    {selectedSizes.includes(s) && <FiCheck size={9} className="inline ml-1" />}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input value={customSize} onChange={e => setCustomSize(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addCustomSize()} placeholder="Custom size…"
                                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300" />
                            <button onClick={addCustomSize} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-black text-gray-600 transition-colors">Add</button>
                        </div>
                        {selectedSizes.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-2.5">
                                <span className="text-[10px] text-gray-400 font-medium self-center">Selected:</span>
                                {selectedSizes.map(s => (
                                    <span key={s} className="flex items-center gap-1 text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-full">
                                        {s}<button onClick={() => toggleSize(s)} className="hover:opacity-70"><FiX size={8} /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Colors</label>
                        <div className="flex gap-2">
                            <input value={colorInput} onChange={e => setColorInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addColor()} placeholder="Type a color and press Enter…"
                                className="flex-1 border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300" />
                            <button onClick={addColor} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-black text-gray-600 transition-colors flex items-center gap-1">
                                <FiPlus size={12} /> Add
                            </button>
                        </div>
                        {colors.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-2.5">
                                {colors.map(c => (
                                    <span key={c} className="flex items-center gap-1 text-[10px] font-black bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full">
                                        {c}<button onClick={() => setColors(p => p.filter(x => x !== c))} className="hover:opacity-60"><FiX size={9} /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">Description</label>
                        <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
                            placeholder="Describe the product…"
                            className="w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 resize-none" />
                    </div>

                    {error && <p className="text-xs text-red-500 font-bold bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-xl">{error}</p>}

                    <button onClick={handleSubmit} disabled={isPending || success}
                        className={`w-full py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${success ? "bg-green-500 text-white" : "bg-black hover:bg-gray-800 text-white disabled:opacity-50"
                            }`}>
                        {success
                            ? <><FiCheck size={15} />{isEdit ? "Updated!" : "Product Created!"}</>
                            : isPending ? (isEdit ? "Updating…" : "Creating…")
                                : <><FiPlus size={15} />{isEdit ? "Update Product" : "Create Product"}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEditProductModal;