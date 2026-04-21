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
  FiUser,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import camo from "../assets/camo.jpg";
import Footer from "../component/Footer";
import LoadingOverlay from "../component/LoadingOverlay";
import Navbar from "../component/Navbar";
import { useShop } from "../providers/ShopContext";

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

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.6ixunit.store";
const SHIPPING_FEE = 1.00;
const CURRENCY_SYMBOL = "€";
const CURRENCY_CODE = "EUR";

const FALLBACK_DIAL_CODES: DialCode[] = [
  { name: "Nigeria", dial_code: "+234", code: "NG", flag: "🇳🇬" },
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "Ghana", dial_code: "+233", code: "GH", flag: "🇬🇭" },
  { name: "Kenya", dial_code: "+254", code: "KE", flag: "🇰🇪" },
  { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
  { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "UAE", dial_code: "+971", code: "AE", flag: "🇦🇪" },
];

const codeToFlag = (iso2: string): string => {
  if (!iso2 || iso2.length !== 2) return "🏳";
  return [...iso2.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("");
};

const fetchDialCodes = async (): Promise<DialCode[]> => {
  const res = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,cca2", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Failed");
  const data: any[] = await res.json();
  const codes: DialCode[] = [];
  for (const country of data) {
    const root: string = country.idd?.root ?? "";
    const suffixes: string[] = country.idd?.suffixes ?? [];
    if (!root) continue;
    const commonName: string = country.name?.common ?? "Unknown";
    const iso2: string = country.cca2 ?? "";
    const seen = new Set<string>();
    for (const suffix of suffixes.length ? suffixes : [""]) {
      const dial_code = `${root}${suffix}`;
      if (seen.has(dial_code)) continue;
      seen.add(dial_code);
      codes.push({ name: commonName, dial_code, code: iso2, flag: codeToFlag(iso2) });
    }
  }
  return codes.sort((a, b) => a.name.localeCompare(b.name));
};

const getStoredUser = (): StoredUser | null => {
  try { return JSON.parse(localStorage.getItem("user") ?? "null"); } catch { return null; }
};
const isValidPhone = (n: string) => /^\d{6,15}$/.test(n.replace(/[\s\-()]/g, ""));
const parseStoredPhone = (raw: string, dialCodes: DialCode[]): { code: string; local: string } => {
  if (!raw) return { code: "+234", local: "" };
  const sorted = [...dialCodes].sort((a, b) => b.dial_code.length - a.dial_code.length);
  for (const dc of sorted) {
    if (raw.startsWith(dc.dial_code)) return { code: dc.dial_code, local: raw.slice(dc.dial_code.length) };
  }
  return { code: "+234", local: raw.replace(/^\+/, "") };
};

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = "text", icon, required = true, colSpan = false, error }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder: string; type?: string; icon?: React.ReactNode;
  required?: boolean; colSpan?: boolean; error?: string;
}) => (
  <div className={colSpan ? "sm:col-span-2" : ""}>
    <label className="block text-xs font-black text-[#c9b99a]/55 mb-1.5 tracking-widest uppercase">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#c9b99a]/35">{icon}</div>}
      <input
        type={type} value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md py-2.5 text-sm outline-none border transition-colors bg-transparent text-[#c9b99a]/70 placeholder:text-[#c9b99a]/20 ${error ? "border-red-500/40" : "border-[#c9b99a]/15 focus:border-[#c9b99a]/45"}`}
        style={{ paddingLeft: icon ? "2.5rem" : "1rem", paddingRight: "1rem" }}
      />
    </div>
    {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
  </div>
);

// ── Location Select ───────────────────────────────────────────────────────────
const LocationSelect = ({ label, value, onChange, options, placeholder, required = true, loading = false, disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; required?: boolean; loading?: boolean; disabled?: boolean;
}) => (
  <div>
    <label className="block text-xs font-black text-[#c9b99a]/55 mb-1.5 tracking-widest uppercase">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading || options.length === 0}
        className="w-full rounded-md px-4 py-2.5 text-sm outline-none border border-[#c9b99a]/15 bg-transparent text-[#c9b99a]/70 appearance-none transition-colors disabled:opacity-40 focus:border-[#c9b99a]/45 cursor-pointer"
      >
        <option value="" style={{ background: "#161614" }}>{loading ? "Loading…" : placeholder}</option>
        {options.map((opt) => <option key={opt} value={opt} style={{ background: "#161614" }}>{opt}</option>)}
      </select>
      <FiChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#c9b99a]/35" />
    </div>
  </div>
);

// ── Phone Dropdown ────────────────────────────────────────────────────────────
const PhoneCodeDropdown = ({ value, onChange, dialCodes, loading }: {
  value: string; onChange: (c: string) => void; dialCodes: DialCode[]; loading: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = dialCodes.find((d) => d.dial_code === value) ?? dialCodes[0];
  const filtered = dialCodes.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.dial_code.includes(search));

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
        disabled={loading}
        className="h-full flex items-center gap-1.5 px-3 text-sm font-medium min-w-22.5 border-r border-[#c9b99a]/15 text-[#c9b99a]/70 disabled:opacity-50 cursor-pointer"
      >
        {loading
          ? <span className="w-3 h-3 border border-[#c9b99a]/40 border-t-transparent rounded-full animate-spin" />
          : <span className="text-base">{selected?.flag}</span>
        }
        <span className="tabular-nums text-xs">{selected?.dial_code ?? "…"}</span>
        <FiChevronDown size={11} className={`text-[#c9b99a]/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-[#161614] rounded-xl shadow-xl border border-[#c9b99a]/20 z-50 overflow-hidden">
          <div className="p-2 border-b border-[#c9b99a]/10">
            <div className="relative">
              <FiSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c9b99a]/35" />
              <input
                autoFocus type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-md outline-none border border-[#c9b99a]/15 bg-transparent text-[#c9b99a]/70 placeholder:text-[#c9b99a]/25"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-xs text-[#c9b99a]/40 text-center py-4">No results</p>
              : filtered.map((d) => (
                <button
                  key={`${d.code}-${d.dial_code}`}
                  type="button"
                  onClick={() => { onChange(d.dial_code); setOpen(false); setSearch(""); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-[#c9b99a]/6 transition-colors cursor-pointer ${d.dial_code === value && d.code === selected?.code ? "font-black" : "font-normal"}`}
                >
                  <span className="text-base w-5 shrink-0">{d.flag}</span>
                  <span className="flex-1 truncate text-[#c9b99a]/70">{d.name}</span>
                  <span className="text-xs text-[#c9b99a]/40 tabular-nums shrink-0">{d.dial_code}</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

// ── Step Badge ────────────────────────────────────────────────────────────────
const StepBadge = ({ n }: { n: number }) => (
  <div className="w-6 h-6 rounded-full bg-[#c9b99a] flex items-center justify-center text-xs font-black text-black shrink-0">{n}</div>
);

// ── Checkout ──────────────────────────────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, cartTotal } = useShop();

  const { discount = 0, couponCode = null } = (location.state as { discount?: number; couponCode?: string | null }) ?? {};
  const storedUser = getStoredUser();

  const [dialCodes, setDialCodes] = useState<DialCode[]>(FALLBACK_DIAL_CODES);
  const [dialCodesLoading, setDialCodesLoading] = useState(true);

  // ── Shipping policy agreement ─────────────────────────────────────────────
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [policyError, setPolicyError] = useState(false);

  useEffect(() => {
    setDialCodesLoading(true);
    fetchDialCodes()
      .then((codes) => { if (codes.length > 0) setDialCodes(codes); })
      .catch(() => { })
      .finally(() => setDialCodesLoading(false));
  }, []);

  const parsedPhone = parseStoredPhone(storedUser?.phone_number ?? "", dialCodes);

  useEffect(() => {
    if (!localStorage.getItem("sxiAccessToken")) navigate("/login", { state: { from: "/checkout", locationState: location.state } });
  }, []);
  useEffect(() => { if (cart.length === 0) navigate("/cart"); }, [cart]);

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [info, setInfo] = useState<ShippingInfo>({
    firstName: storedUser?.first_name ?? "", lastName: storedUser?.last_name ?? "",
    email: storedUser?.email ?? "", phoneCode: parsedPhone.code, phoneNumber: parsedPhone.local,
    address: "", city: "", state: "", zip: "", country: "",
  });

  useEffect(() => {
    if (!dialCodesLoading && storedUser?.phone_number) {
      const parsed = parseStoredPhone(storedUser.phone_number, dialCodes);
      setInfo((p) => ({ ...p, phoneCode: parsed.code, phoneNumber: parsed.local }));
    }
  }, [dialCodesLoading]);

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalEUR = parseFloat((cartTotal - discount + SHIPPING_FEE).toFixed(2));

  useEffect(() => {
    setLoadingCountries(true);
    fetch("https://countriesnow.space/api/v0.1/countries/positions")
      .then((r) => r.json())
      .then((d) => { if (!d.error && Array.isArray(d.data)) setCountries(d.data.map((c: { name: string }) => c.name).sort()); })
      .catch(() => setCountries(["Nigeria", "United States", "United Kingdom", "Ghana", "Kenya"]))
      .finally(() => setLoadingCountries(false));
  }, []);

  useEffect(() => {
    if (!info.country) return;
    setStates([]); setCities([]);
    setInfo((p) => ({ ...p, state: "", city: "" }));
    setLoadingStates(true);
    fetch("https://countriesnow.space/api/v0.1/countries/states", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country: info.country }) })
      .then((r) => r.json()).then((d) => { if (!d.error && d.data?.states) setStates(d.data.states.map((s: { name: string }) => s.name).sort()); })
      .catch(() => setStates([])).finally(() => setLoadingStates(false));
  }, [info.country]);

  useEffect(() => {
    if (!info.country || !info.state) return;
    setCities([]); setInfo((p) => ({ ...p, city: "" }));
    setLoadingCities(true);
    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country: info.country, state: info.state }) })
      .then((r) => r.json()).then((d) => { if (!d.error && Array.isArray(d.data)) setCities(d.data.sort()); })
      .catch(() => setCities([])).finally(() => setLoadingCities(false));
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

    // Policy check
    if (!agreedToPolicy) {
      setPolicyError(true);
      document.getElementById("policy-check")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

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
          shipping_country: info.country, shipping_method: "standard",
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
      if (!res.headers.get("content-type")?.includes("application/json")) throw new Error(`Unexpected server response (HTTP ${res.status}).`);
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
    <div
      className="min-h-screen relative"
      style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <LoadingOverlay visible={loading} />

        <div className="max-w-5xl mx-auto px-4 py-8 flex-1">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#c9b99a]/40 mb-6">
            <Link to="/" className="hover:text-[#c9b99a] transition-colors font-medium">Home</Link>
            <FiChevronRight size={12} />
            <Link to="/cart" className="hover:text-[#c9b99a] transition-colors font-medium">Cart</Link>
            <FiChevronRight size={12} />
            <span className="font-bold text-[#c9b99a]">Checkout</span>
          </nav>

          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-0.75 h-5 bg-[#c9b99a] rounded-sm" />
            <h1 className="text-base font-black text-[#c9b99a] tracking-widest uppercase">Checkout</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-5">

            {/* ── LEFT ── */}
            <div className="flex-1 space-y-4">

              {/* Step 1 — Shipping Details */}
              <div className="border border-[#c9b99a]/12 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <StepBadge n={1} />
                  <h2 className="font-black text-sm text-[#c9b99a] tracking-widest uppercase">Shipping Details</h2>
                  {storedUser && (
                    <span className="ml-auto text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
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
                    <label className="block text-xs font-black text-[#c9b99a]/55 mb-1.5 tracking-widest uppercase">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className={`flex rounded-md overflow-visible border ${phoneError ? "border-red-500/40" : "border-[#c9b99a]/15 focus-within:border-[#c9b99a]/45"} transition-colors`}>
                      <PhoneCodeDropdown value={info.phoneCode} onChange={(c) => setInfo((p) => ({ ...p, phoneCode: c }))} dialCodes={dialCodes} loading={dialCodesLoading} />
                      <input
                        type="tel" value={info.phoneNumber}
                        onChange={(e) => { setInfo((p) => ({ ...p, phoneNumber: e.target.value })); if (phoneError) setPhoneError(null); }}
                        onBlur={validatePhone}
                        placeholder="8012345678"
                        className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-[#c9b99a]/70 placeholder:text-[#c9b99a]/20 border-l border-[#c9b99a]/15 min-w-0"
                      />
                    </div>
                    {phoneError && <p className="text-[11px] text-red-400 mt-1">{phoneError}</p>}
                    {!phoneError && info.phoneNumber && isValidPhone(info.phoneNumber) && (
                      <p className="text-[11px] text-green-400 mt-1 flex items-center gap-1">
                        <FiCheck size={10} /> {info.phoneCode} {info.phoneNumber.replace(/^0+/, "")}
                      </p>
                    )}
                  </div>

                  <Field label="Street Address" value={info.address} onChange={(v) => setInfo({ ...info, address: v })} placeholder="123 Main Street" icon={<FiMapPin size={13} />} colSpan />

                  <div className="sm:col-span-2">
                    <LocationSelect label="Country" value={info.country} onChange={(v) => setInfo({ ...info, country: v })} options={countries} placeholder={loadingCountries ? "Loading…" : "Select country"} loading={loadingCountries} />
                  </div>
                  <LocationSelect label="State / Province" value={info.state} onChange={(v) => setInfo({ ...info, state: v })} options={states} placeholder={info.country ? (loadingStates ? "Loading…" : "Select state") : "Select country first"} loading={loadingStates} disabled={!info.country} />
                  <LocationSelect label="City" value={info.city} onChange={(v) => setInfo({ ...info, city: v })} options={cities} placeholder={info.state ? (loadingCities ? "Loading…" : "Select city") : "Select state first"} loading={loadingCities} disabled={!info.state} required={false} />
                  <Field label="ZIP / Postal Code" value={info.zip} onChange={(v) => setInfo({ ...info, zip: v })} placeholder="10001" />
                </div>
              </div>

              {/* Step 2 — Shipping Method */}
              <div className="border border-[#c9b99a]/12 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <StepBadge n={2} />
                  <h2 className="font-black text-sm text-[#c9b99a] tracking-widest uppercase">Shipping</h2>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-md border border-[#c9b99a]/25 bg-[#c9b99a]/4">
                  <div className="w-4 h-4 rounded-full border-2 border-[#c9b99a] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#c9b99a]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#c9b99a] uppercase tracking-wide">Standard Shipping</p>
                    <p className="text-xs text-[#c9b99a]/40">5–7 business days</p>
                  </div>
                  <span className="text-sm font-black text-[#c9b99a] shrink-0">{CURRENCY_SYMBOL}{SHIPPING_FEE.toFixed(2)}</span>
                </div>

                {/* Shipping Policy Link */}
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to="/shipping-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-[#c9b99a]/50 hover:text-[#c9b99a] transition-colors tracking-wide underline underline-offset-2"
                  >
                    <FiExternalLink size={10} />
                    View our full Shipping Policy
                  </Link>
                </div>
              </div>

              {/* Step 3 — Payment */}
              <div className="border border-[#c9b99a]/12 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <StepBadge n={3} />
                  <h2 className="font-black text-sm text-[#c9b99a] tracking-widest uppercase">Payment</h2>
                </div>

                {/* ── Shipping Policy Agreement ── */}
                <div id="policy-check" className={`mb-5 p-4 border transition-colors ${policyError ? "border-red-500/40 bg-red-500/5" : "border-[#c9b99a]/12 bg-[rgba(201,185,154,0.04)]"}`}>
                  <button
                    type="button"
                    onClick={() => { setAgreedToPolicy((v) => !v); setPolicyError(false); }}
                    className="flex items-start gap-3 w-full text-left cursor-pointer group"
                  >
                    {/* Custom checkbox */}
                    <div className={`w-5 h-5 shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${agreedToPolicy ? "bg-[#c9b99a] border-[#c9b99a]" : policyError ? "border-red-500/60 bg-transparent" : "border-[#c9b99a]/30 bg-transparent group-hover:border-[#c9b99a]/60"}`}>
                      {agreedToPolicy && <FiCheck size={11} className="text-[#28251e]" strokeWidth={3} />}
                    </div>
                    <p className="text-[12px] text-[#c9b99a]/60 leading-relaxed">
                      I have read and agree to the{" "}
                      <Link
                        to="/shipping-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#c9b99a] font-bold underline underline-offset-2 hover:opacity-70 transition-opacity"
                      >
                        Shipping Policy
                      </Link>
                      , including delivery timelines, import duties, customs responsibilities, and the policy on refused shipments.
                    </p>
                  </button>
                  {policyError && (
                    <p className="text-[11px] text-red-400 mt-2 ml-8 font-semibold tracking-wide">
                      You must agree to the shipping policy before proceeding.
                    </p>
                  )}
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={!isFormValid || loading}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-md font-black text-sm tracking-widest uppercase transition-all cursor-pointer ${!isFormValid || loading
                    ? "bg-[#c9b99a]/20 text-[#c9b99a]/30 cursor-not-allowed"
                    : !agreedToPolicy
                      ? "bg-[#c9b99a]/40 text-[#28251e]/60 hover:bg-[#c9b99a]/50"
                      : "bg-[#c9b99a] text-black hover:bg-[#e0d2b6]"
                    }`}
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Redirecting…</>
                    : <><FiLock size={14} /> Pay {CURRENCY_SYMBOL}{totalEUR.toFixed(2)} {CURRENCY_CODE} <FiExternalLink size={12} className="opacity-60" /></>
                  }
                </button>

                {!agreedToPolicy && isFormValid && (
                  <p className="text-center text-[10px] text-[#c9b99a]/35 mt-2.5 tracking-wide">
                    Please agree to the shipping policy above to continue
                  </p>
                )}
              </div>
            </div>

            {/* ── RIGHT — Order Summary ── */}
            <div className="lg:w-72 shrink-0">
              <div className="border border-[#c9b99a]/12 rounded-2xl p-5 sticky top-24">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-0.75 h-4 bg-[#c9b99a] rounded-sm" />
                  <h2 className="font-black text-sm text-[#c9b99a] tracking-widest uppercase">Order Summary</h2>
                </div>

                <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={item.img} alt={item.name} className="w-11 h-11 rounded-md object-cover bg-black/40 border border-[#c9b99a]/12" />
                        <span className="absolute top-1 -right-2 w-4 h-4 bg-[#c9b99a] border border-black text-black text-[9px] rounded-full flex items-center justify-center font-black">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#c9b99a] truncate uppercase tracking-wide">{item.name}</p>
                        {item.selectedColor && (
                          <p className="text-[10px] text-[#c9b99a]/40">{item.selectedColor}{item.selectedSize ? ` · ${item.selectedSize}` : ""}</p>
                        )}
                      </div>
                      <span className="text-xs font-black text-white shrink-0">
                        {CURRENCY_SYMBOL}{(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t border-[#c9b99a]/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9b99a]/55">Subtotal</span>
                    <span className="font-semibold text-[#c9b99a]">{CURRENCY_SYMBOL}{cartTotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400 font-semibold">Coupon ({couponCode})</span>
                      <span className="font-semibold text-green-400">-{CURRENCY_SYMBOL}{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9b99a]/55">Shipping</span>
                    <span className="font-semibold text-[#c9b99a]">{CURRENCY_SYMBOL}{SHIPPING_FEE.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#c9b99a]/10 flex justify-between items-center">
                    <span className="font-black text-[#c9b99a] uppercase tracking-widest text-xs">Total</span>
                    <span className="font-black text-lg text-white">{CURRENCY_SYMBOL}{totalEUR.toFixed(2)} {CURRENCY_CODE}</span>
                  </div>
                </div>

                {/* Shipping policy reminder in sidebar */}
                <div className="mt-4 pt-4 border-t border-[#c9b99a]/10">
                  <Link
                    to="/shipping-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-[10px] text-[#c9b99a]/35 hover:text-[#c9b99a]/60 transition-colors tracking-wide"
                  >
                    <FiExternalLink size={9} />
                    Shipping Policy
                  </Link>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <FiLock size={11} className="text-[#c9b99a]/35" />
                  <span className="text-[10px] text-[#c9b99a]/35">Secured by</span>
                  <span className="text-[10px] font-black text-[#635BFF]">Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Checkout;