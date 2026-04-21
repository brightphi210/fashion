import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiChevronDown, FiLoader, FiPlus, FiX } from "react-icons/fi";

// const API_BASE = import.meta.env.VITE_API_URL ?? "http://api.6ixunit.store";
const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40", "One Size"];
const PRESET_COLORS = [
    "Black", "White", "Grey", "Navy", "Royal Blue", "Sky Blue", "Red", "Burgundy",
    "Green", "Olive", "Khaki", "Beige", "Tan", "Brown", "Orange", "Yellow",
    "Pink", "Purple", "Cream", "Charcoal", "Camo", "Mint", "Coral", "Gold",
];

interface SizeEntry { name: string; is_available: boolean; }
interface ColorEntry { name: string; is_available: boolean; }

interface Props { product: any; onClose: () => void; }

const FIELD_CONFIG = [
    { key: "name", label: "Product Name", type: "text", full: true },
    { key: "price", label: "Price (€)", type: "number", full: false },
    { key: "old_price", label: "Old Price (€)", type: "number", full: false },
    { key: "discount", label: "Discount (%)", type: "number", full: false },
    { key: "tag", label: "Tag", type: "text", full: false },
];

const EditProductTextModal = ({ product, onClose }: Props) => {
    const queryClient = useQueryClient();

    // ── Text fields ──────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        name: product.name ?? "",
        price: product.price ?? "",
        old_price: product.old_price ?? "",
        discount: product.discount ?? "",
        tag: product.tag ?? "",
        description: product.description ?? "",
        is_available: product.is_available ?? true,
    });

    // ── Sizes ────────────────────────────────────────────────────────────────
    // Replace your sizes useState initializer:
    const [sizes, setSizes] = useState<SizeEntry[]>(() =>
        (product.sizes ?? []).map((s: any) => ({
            name: String(s?.name ?? s ?? "").trim(),
            is_available: s?.is_available ?? true,
        })).filter((s: SizeEntry) => s.name !== "")
    );
    const [customSize, setCustomSize] = useState("");

    // ── Colors ───────────────────────────────────────────────────────────────
    const [colors, setColors] = useState<ColorEntry[]>(() =>
        (product.colors ?? []).map((c: any) => ({
            name: typeof c === "string" ? c : c.name,
            is_available: typeof c === "string" ? true : (c.is_available ?? true),
        }))
    );
    const [colorDropdown, setColorDropdown] = useState("");

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Mutation ─────────────────────────────────────────────────────────────
    const mutation = useMutation({
        mutationFn: async (payload: object) => {
            const token = localStorage.getItem("access");
            const { data } = await axios.patch(
                `${API_BASE}/api/products/${product.id}/`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            onClose();
        },
        onError: (err: any) => {
            const detail = err?.response?.data;
            if (detail && typeof detail === "object") {
                const mapped: Record<string, string> = {};
                for (const [k, v] of Object.entries(detail)) {
                    mapped[k] = Array.isArray(v) ? (v as string[]).join(" ") : String(v);
                }
                setErrors(mapped);
            }
        },
    });

    // ── Helpers ──────────────────────────────────────────────────────────────
    const setField = (key: string, val: any) => {
        setForm(f => ({ ...f, [key]: val }));
        setErrors(e => { const n = { ...e }; delete n[key]; return n; });
    };

    const toggleSizeAvail = (name: string) =>
        setSizes(prev => prev.map(s => s.name === name ? { ...s, is_available: !s.is_available } : s));

    const removeSize = (name: string) => setSizes(prev => prev.filter(s => s.name !== name));

    const addPresetSize = (name: string) => {
        if (!sizes.find(s => s.name === name)) {
            setSizes(prev => [...prev, { name, is_available: true }]);
        }
    };

    const addCustomSize = () => {
        const name = customSize.trim();
        if (name && !sizes.find(s => s.name === name)) {
            setSizes(prev => [...prev, { name, is_available: true }]);
        }
        setCustomSize("");
    };

    const toggleColorAvail = (name: string) =>
        setColors(prev => prev.map(c => c.name === name ? { ...c, is_available: !c.is_available } : c));

    const removeColor = (name: string) => setColors(prev => prev.filter(c => c.name !== name));

    const addColor = () => {
        const name = colorDropdown.trim();
        if (name && !colors.find(c => c.name === name)) {
            setColors(prev => [...prev, { name, is_available: true }]);
        }
        setColorDropdown("");
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = "Name is required.";
        if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const payload: any = { ...form };
        if (payload.old_price === "") delete payload.old_price;
        if (payload.discount === "") delete payload.discount;
        if (payload.tag === "") delete payload.tag;
        payload.sizes = sizes;
        payload.colors = colors;
        mutation.mutate(payload);
    };

    // Close on Escape
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    const availableSizePresets = PRESET_SIZES.filter(s => !sizes.find(x => x.name === s));
    const availableColorPresets = PRESET_COLORS.filter(c => !colors.find(x => x.name === c));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-black text-gray-900">Edit Product</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Images are unchanged — text, sizes & colors only</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <FiX size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

                    {/* ── Text fields ── */}
                    <div className="grid grid-cols-2 gap-4">
                        {FIELD_CONFIG.map(({ key, label, type, full }) => (
                            <div key={key} className={full ? "col-span-2" : "col-span-1"}>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</label>
                                <input
                                    type={type}
                                    step={type === "number" ? "0.01" : undefined}
                                    value={(form as any)[key]}
                                    onChange={e => setField(key, e.target.value)}
                                    className={`w-full px-3 py-2 rounded-xl border-2 text-sm font-medium text-gray-800 focus:outline-none transition-colors
                                        ${errors[key] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-black"}`}
                                    placeholder={label}
                                />
                                {errors[key] && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors[key]}</p>}
                            </div>
                        ))}
                    </div>

                    {/* ── Description ── */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Description</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={e => setField("description", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-black focus:outline-none text-sm font-medium text-gray-800 resize-none transition-colors"
                            placeholder="Product description…"
                        />
                    </div>

                    {/* ── Availability toggle ── */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-100">
                        <div>
                            <p className="text-xs font-black text-gray-700">Available for purchase</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                {form.is_available ? "Visible and purchasable in store" : "Hidden from store"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setField("is_available", !form.is_available)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.is_available ? "bg-black" : "bg-gray-300"}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.is_available ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                    </div>

                    {/* ── Sizes ── */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Sizes
                            <span className="ml-2 normal-case font-normal text-gray-300">— click to toggle availability</span>
                        </label>

                        {/* Current sizes — shown exactly like colors */}
                        {sizes.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mb-3">
                                {sizes.map(s => (
                                    <div key={s.name} className="flex items-center gap-0.5 group">
                                        <button
                                            type="button"
                                            onClick={() => toggleSizeAvail(s.name)}
                                            title={s.is_available ? "Click to mark as sold out" : "Click to mark as available"}
                                            style={{ textDecoration: s.is_available ? "none" : "line-through" }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all select-none${s.is_available
                                                ? "border-black bg-black text-white"
                                                : "border-gray-300 bg-gray-50 text-gray-400"
                                                }`}
                                        >
                                            {s.name}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeSize(s.name)}
                                            className="w-4 h-4 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiX size={8} className="text-gray-500 hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Warning for sold-out sizes */}
                        {sizes.some(s => !s.is_available) && (
                            <p className="text-[10px] text-amber-500 font-semibold mb-2">
                                ⚠ Strikethrough sizes are marked as sold out — customers will see them as unavailable.
                            </p>
                        )}

                        {/* Add from presets — only sizes not yet added */}
                        {PRESET_SIZES.filter(s => !sizes.find(x => x.name === s)).length > 0 && (
                            <div className="mb-2">
                                <p className="text-[9px] text-gray-300 uppercase tracking-widest font-black mb-1.5">Add size</p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {PRESET_SIZES.filter(s => !sizes.find(x => x.name === s)).map(name => (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => setSizes(prev => [...prev, { name, is_available: true }])}
                                            className="px-2.5 py-1 rounded-lg text-[10px] font-black border border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            + {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Custom size input */}
                        <div className="flex gap-2 mt-2">
                            <input
                                value={customSize}
                                onChange={e => setCustomSize(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addCustomSize()}
                                placeholder="Custom size e.g. 42, 7.5, Petite…"
                                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                            />
                            <button
                                onClick={addCustomSize}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-black text-gray-600 transition-colors flex items-center gap-1"
                            >
                                <FiPlus size={11} /> Add
                            </button>
                        </div>
                    </div>

                    {/* ── Colors ── */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Colors
                            <span className="ml-2 normal-case font-normal text-gray-300">— click to toggle availability</span>
                        </label>

                        {/* Current colors */}
                        {colors.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mb-3">
                                {colors.map(c => (
                                    <div key={c.name} className="flex items-center gap-0.5 group">
                                        <button
                                            type="button"
                                            onClick={() => toggleColorAvail(c.name)}
                                            title={c.is_available ? "Click to mark as sold out" : "Click to mark as available"}
                                            className={`relative px-3 py-1 rounded-full text-[10px] font-black border transition-all ${c.is_available
                                                ? "bg-gray-800 text-white border-gray-800"
                                                : "bg-gray-50 text-gray-400 border-gray-200"
                                                }`}
                                        >
                                            {!c.is_available && (
                                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-full overflow-hidden">
                                                    <span className="w-full h-[1.5px] bg-gray-400 absolute" />
                                                </span>
                                            )}
                                            {c.name}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeColor(c.name)}
                                            className="w-4 h-4 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiX size={8} className="text-gray-500 hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {colors.some(c => !c.is_available) && (
                            <p className="text-[10px] text-amber-500 font-semibold mb-2">
                                ⚠ Strikethrough colors are marked as sold out.
                            </p>
                        )}

                        {/* Add color from dropdown */}
                        {availableColorPresets.length > 0 && (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        value={colorDropdown}
                                        onChange={e => setColorDropdown(e.target.value)}
                                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-black transition-colors appearance-none bg-white"
                                    >
                                        <option value="">Add a color…</option>
                                        {availableColorPresets.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <FiChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                <button
                                    onClick={addColor}
                                    disabled={!colorDropdown}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-xl text-xs font-black text-gray-600 transition-colors flex items-center gap-1"
                                >
                                    <FiPlus size={11} /> Add
                                </button>
                            </div>
                        )}
                    </div>

                    {errors.non_field_errors && (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 rounded-xl px-3 py-2">{errors.non_field_errors}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {mutation.isPending
                            ? <><FiLoader size={13} className="animate-spin" /> Saving…</>
                            : "Save Changes"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductTextModal;