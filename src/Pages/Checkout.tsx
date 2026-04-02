import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiExternalLink,
  FiLock,
  FiMail,
  FiMapPin,
  FiSearch,
  FiUser
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../component/Footer";
import LoadingOverlay from "../component/LoadingOverlay";
import Navbar from "../component/Navbar";
import { useShop } from "../providers/ShopContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type ShippingInfo = {
  firstName: string; lastName: string; email: string;
  phoneCode: string; phoneNumber: string;
  address: string; city: string; state: string; zip: string; country: string;
};
type StoredUser = {
  id: number; first_name: string; last_name: string; full_name: string;
  email: string; phone_number: string; is_email_verified: boolean; date_joined: string;
};
type DialCode = { name: string; dial_code: string; code: string; flag: string };

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Shipping", sub: "5–7 business days", price: 0, display: "Free" },
  { id: "express", label: "Express Shipping", sub: "2–3 business days", price: 9.99, display: "$9.99" },
];

const DIAL_CODES: DialCode[] = [
  { name: "Nigeria", dial_code: "+234", code: "NG", flag: "🇳🇬" },
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "Ghana", dial_code: "+233", code: "GH", flag: "🇬🇭" },
  { name: "Kenya", dial_code: "+254", code: "KE", flag: "🇰🇪" },
  { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
  { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
  { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
  { name: "UAE", dial_code: "+971", code: "AE", flag: "🇦🇪" },
  { name: "Singapore", dial_code: "+65", code: "SG", flag: "🇸🇬" },
  { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
  { name: "China", dial_code: "+86", code: "CN", flag: "🇨🇳" },
  { name: "Pakistan", dial_code: "+92", code: "PK", flag: "🇵🇰" },
  { name: "Egypt", dial_code: "+20", code: "EG", flag: "🇪🇬" },
];

const getStoredUser = (): StoredUser | null => {
  try { return JSON.parse(localStorage.getItem("user") ?? "null"); } catch { return null; }
};
const isValidPhone = (n: string) => /^\d{6,15}$/.test(n.replace(/[\s\-()]/g, ""));
const parseStoredPhone = (raw: string): { code: string; local: string } => {
  if (!raw) return { code: "+234", local: "" };
  const sorted = [...DIAL_CODES].sort((a, b) => b.dial_code.length - a.dial_code.length);
  for (const dc of sorted) {
    if (raw.startsWith(dc.dial_code)) return { code: dc.dial_code, local: raw.slice(dc.dial_code.length) };
  }
  return { code: "+234", local: raw.replace(/^\+/, "") };
};

// ─── Phone Code Dropdown ──────────────────────────────────────────────────────
const PhoneCodeDropdown = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = DIAL_CODES.find((d) => d.dial_code === value) ?? DIAL_CODES[0];
  const filtered = DIAL_CODES.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.dial_code.includes(search)
  );

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-full flex items-center gap-1.5 px-3 text-sm font-medium min-w-[90px] bg-gray-50 border-r border-gray-200 rounded-l-xl text-gray-700"
      >
        <span className="text-base">{selected.flag}</span>
        <span className="tabular-nums text-xs">{selected.dial_code}</span>
        <FiChevronDown size={11} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <FiSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input autoFocus type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none border border-gray-200 bg-gray-50"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((d) => (
              <button key={`${d.code}-${d.dial_code}`} type="button"
                onClick={() => { onChange(d.dial_code); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${d.dial_code === value ? "font-black bg-gray-50" : "font-normal"}`}
              >
                <span className="text-base w-5 shrink-0">{d.flag}</span>
                <span className="flex-1 truncate text-gray-700">{d.name}</span>
                <span className="text-xs text-gray-400 tabular-nums shrink-0">{d.dial_code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = "text", icon, required = true, colSpan = false, error }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder: string; type?: string; icon?: React.ReactNode;
  required?: boolean; colSpan?: boolean; error?: string;
}) => (
  <div className={colSpan ? "sm:col-span-2" : ""}>
    <label className="text-xs font-black text-gray-700 mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">{icon}</div>}
      <input
        type={type} value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl py-2.5 text-sm outline-none border transition-colors bg-gray-50 text-gray-800 focus:bg-white"
        style={{
          paddingLeft: icon ? "2.5rem" : "1rem",
          paddingRight: "1rem",
          borderColor: error ? "#ef4444" : "#e5e7eb",
        }}
        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#000"; }}
        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = error ? "#ef4444" : "#e5e7eb"; }}
      />
    </div>
    {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
  </div>
);

// ─── Location Select ──────────────────────────────────────────────────────────
const LocationSelect = ({ label, value, onChange, options, placeholder, required = true, loading = false, disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; required?: boolean; loading?: boolean; disabled?: boolean;
}) => (
  <div>
    <label className="text-xs font-black text-gray-700 mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading || options.length === 0}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border border-gray-200 bg-gray-50 text-gray-800 appearance-none transition-colors disabled:text-gray-400 focus:border-black"
      >
        <option value="">{loading ? "Loading…" : placeholder}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <FiChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
    </div>
  </div>
);

// ─── Step Badge ───────────────────────────────────────────────────────────────
const StepBadge = ({ n }: { n: number }) => (
  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-xs font-black text-white shrink-0">{n}</div>
);

// ─── Checkout ─────────────────────────────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, cartTotal } = useShop();

  const { discount = 0, couponCode = null } =
    (location.state as { discount?: number; couponCode?: string | null }) ?? {};

  const storedUser = getStoredUser();
  const parsedPhone = parseStoredPhone(storedUser?.phone_number ?? "");

  useEffect(() => {
    if (!localStorage.getItem("sxiAccessToken"))
      navigate("/login", { state: { from: "/checkout", locationState: location.state } });
  }, []);

  useEffect(() => { if (cart.length === 0) navigate("/cart"); }, [cart]);

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_OPTIONS[0]);
  const [info, setInfo] = useState<ShippingInfo>({
    firstName: storedUser?.first_name ?? "", lastName: storedUser?.last_name ?? "",
    email: storedUser?.email ?? "", phoneCode: parsedPhone.code, phoneNumber: parsedPhone.local,
    address: "", city: "", state: "", zip: "", country: "",
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalUSD = parseFloat((cartTotal - discount + shippingMethod.price).toFixed(2));

  useEffect(() => {
    setLoadingCountries(true);
    fetch("https://countriesnow.space/api/v0.1/countries/positions")
      .then((r) => r.json())
      .then((d) => { if (!d.error && Array.isArray(d.data)) setCountries(d.data.map((c: { name: string }) => c.name).sort()); })
      .catch(() => setCountries(["Nigeria", "United States", "United Kingdom", "Ghana", "Kenya", "South Africa", "Canada", "Australia"]))
      .finally(() => setLoadingCountries(false));
  }, []);

  useEffect(() => {
    if (!info.country) return;
    setStates([]); setCities([]);
    setInfo((p) => ({ ...p, state: "", city: "" }));
    setLoadingStates(true);
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: info.country }),
    })
      .then((r) => r.json())
      .then((d) => { if (!d.error && d.data?.states) setStates(d.data.states.map((s: { name: string }) => s.name).sort()); })
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, [info.country]);

  useEffect(() => {
    if (!info.country || !info.state) return;
    setCities([]);
    setInfo((p) => ({ ...p, city: "" }));
    setLoadingCities(true);
    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: info.country, state: info.state }),
    })
      .then((r) => r.json())
      .then((d) => { if (!d.error && Array.isArray(d.data)) setCities(d.data.sort()); })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [info.state]);

  const validatePhone = () => {
    if (!info.phoneNumber.trim()) { setPhoneError("Phone number is required."); return false; }
    if (!isValidPhone(info.phoneNumber)) { setPhoneError("Enter a valid phone number (6–15 digits)."); return false; }
    setPhoneError(null); return true;
  };

  const isFormValid =
    info.firstName.trim() && info.lastName.trim() && info.email.trim() &&
    info.phoneNumber.trim() && isValidPhone(info.phoneNumber) &&
    info.address.trim() && info.country && info.zip.trim();

  const handleCheckout = async () => {
    if (!validatePhone() || !isFormValid || loading) return;
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("sxiAccessToken");
      if (!token) { navigate("/login", { state: { from: "/checkout" } }); return; }
      const fullPhone = `${info.phoneCode}${info.phoneNumber.replace(/^0+/, "")}`;
      const res = await fetch(`${API_BASE}/api/payments/create-checkout-session/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shipping_first_name: info.firstName, shipping_last_name: info.lastName,
          shipping_email: info.email, shipping_phone: fullPhone,
          shipping_street_address: info.address, shipping_city: info.city || info.state,
          shipping_state: info.state, shipping_postal_code: info.zip,
          shipping_country: info.country, shipping_method: shippingMethod.id,
          coupon_code: couponCode ?? null, discount_amount: discount,
          items: cart.map((item) => ({
            product_id: item.id, name: item.name, image: item.img,
            color: item.selectedColor ?? "", size: item.selectedSize ?? "",
            quantity: item.quantity, price: item.price,
          })),
          success_url: `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout`,
        }),
      });
      if (!res.headers.get("content-type")?.includes("application/json"))
        throw new Error(`Unexpected server response (HTTP ${res.status}).`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) { localStorage.removeItem("sxiAccessToken"); localStorage.removeItem("user"); navigate("/login"); return; }
        throw new Error(errData?.detail ?? `Server error (${res.status}).`);
      }
      const data = await res.json();
      const checkoutUrl = data.checkout_url ?? data.url;
      if (!checkoutUrl) throw new Error("No checkout URL returned from server.");
      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <LoadingOverlay visible={loading} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-black transition-colors font-medium">Home</Link>
          <FiChevronRight size={13} />
          <Link to="/cart" className="hover:text-black transition-colors font-medium">Cart</Link>
          <FiChevronRight size={13} />
          <span className="font-bold text-gray-800">Checkout</span>
        </nav>

        <h1 className="text-xl font-black text-black mb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── LEFT ── */}
          <div className="flex-1 space-y-4">

            {/* Step 1 — Shipping */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-5">
                <StepBadge n={1} />
                <h2 className="font-black text-base text-black">Shipping Details</h2>
                {storedUser && (
                  <span className="ml-auto text-[10px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <FiCheck size={9} /> Pre-filled
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" value={info.firstName} onChange={(v) => setInfo({ ...info, firstName: v })} placeholder="John" icon={<FiUser size={13} />} />
                <Field label="Last Name" value={info.lastName} onChange={(v) => setInfo({ ...info, lastName: v })} placeholder="Doe" icon={<FiUser size={13} />} />
                <Field label="Email Address" value={info.email} onChange={(v) => setInfo({ ...info, email: v })} placeholder="john@example.com" type="email" icon={<FiMail size={13} />} />

                {/* Phone */}
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1.5 block">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex rounded-xl overflow-visible border ${phoneError ? "border-red-400" : "border-gray-200"} focus-within:border-black transition-colors`}>
                    <PhoneCodeDropdown value={info.phoneCode} onChange={(c) => setInfo((p) => ({ ...p, phoneCode: c }))} />
                    <input
                      type="tel" value={info.phoneNumber}
                      onChange={(e) => { setInfo((p) => ({ ...p, phoneNumber: e.target.value })); if (phoneError) setPhoneError(null); }}
                      onBlur={validatePhone}
                      placeholder="8012345678"
                      className="flex-1 px-3 py-2.5 text-sm outline-none rounded-r-xl bg-gray-50 text-gray-800 border-l border-gray-200 min-w-0"
                    />
                  </div>
                  {phoneError && <p className="text-[11px] text-red-500 mt-1 font-medium">{phoneError}</p>}
                  {!phoneError && info.phoneNumber && isValidPhone(info.phoneNumber) && (
                    <p className="text-[11px] text-green-600 mt-1 font-medium flex items-center gap-1">
                      <FiCheck size={10} /> {info.phoneCode} {info.phoneNumber.replace(/^0+/, "")}
                    </p>
                  )}
                </div>

                <Field label="Street Address" value={info.address} onChange={(v) => setInfo({ ...info, address: v })} placeholder="123 Main Street" icon={<FiMapPin size={13} />} colSpan />

                <div className="sm:col-span-2">
                  <LocationSelect label="Country" value={info.country} onChange={(v) => setInfo({ ...info, country: v })}
                    options={countries} placeholder={loadingCountries ? "Loading…" : "Select country"} loading={loadingCountries} />
                </div>
                <LocationSelect label="State / Province" value={info.state} onChange={(v) => setInfo({ ...info, state: v })}
                  options={states} placeholder={info.country ? (loadingStates ? "Loading…" : "Select state") : "Select country first"}
                  loading={loadingStates} disabled={!info.country} required={false} />
                <LocationSelect label="City" value={info.city} onChange={(v) => setInfo({ ...info, city: v })}
                  options={cities} placeholder={info.state ? (loadingCities ? "Loading…" : "Select city") : "Select state first"}
                  loading={loadingCities} disabled={!info.state} />
                <Field label="ZIP / Postal Code" value={info.zip} onChange={(v) => setInfo({ ...info, zip: v })} placeholder="10001" />
              </div>
            </div>

            {/* Step 2 — Shipping Method */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <StepBadge n={2} />
                <h2 className="font-black text-base text-black">Shipping Method</h2>
              </div>
              <div className="space-y-2">
                {SHIPPING_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setShippingMethod(opt)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left border-2 ${shippingMethod.id === opt.id ? "border-black bg-black/[0.02]" : "border-gray-100 hover:border-gray-300"
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${shippingMethod.id === opt.id ? "border-black" : "border-gray-300"}`}>
                      {shippingMethod.id === opt.id && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.sub}</p>
                    </div>
                    <span className={`text-sm font-black shrink-0 ${opt.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                      {opt.display}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 — Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">

              <button
                onClick={handleCheckout}
                disabled={!isFormValid || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all bg-black text-white hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting…</>
                  : <><FiLock size={14} /> Pay ${totalUSD.toFixed(2)} USD <FiExternalLink size={12} className="opacity-60" /></>
                }
              </button>
            </div>
          </div>

          {/* ── RIGHT — Order Summary ── */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h2 className="font-black text-sm text-black mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={item.img} alt={item.name} className="w-11 h-11 rounded-lg object-cover bg-gray-100" />
                      <span className="absolute top-1 -right-2 w-4 h-4 bg-black border border-white text-white text-[9px] rounded-full flex items-center justify-center font-black">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                      {item.selectedColor && (
                        <p className="text-[10px] text-gray-400">{item.selectedColor}{item.selectedSize ? ` · ${item.selectedSize}` : ""}</p>
                      )}
                    </div>
                    <span className="text-xs font-black text-gray-900 shrink-0">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-800">${cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold">Coupon ({couponCode})</span>
                    <span className="font-semibold text-green-600">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-semibold ${shippingMethod.price === 0 ? "text-green-600" : "text-gray-800"}`}>
                    {shippingMethod.price === 0 ? "Free" : `$${shippingMethod.price.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-black text-black">Total</span>
                  <span className="font-black text-lg text-black">${totalUSD.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-gray-400">
                <FiLock size={11} />
                <span className="text-[10px]">Secured by</span>
                <span className="text-[10px] font-black text-[#635BFF]">Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;