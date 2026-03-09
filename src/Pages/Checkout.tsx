import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FiChevronRight, FiArrowLeft, FiLock, FiCheck,
    FiUser, FiMail, FiPhone, FiMapPin,
    FiClock, FiPackage, FiCopy, FiChevronDown,
} from "react-icons/fi";
import { HiOutlineTruck } from "react-icons/hi";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { useShop } from "../providers/ShopContext";

type ShippingInfo = {
  firstName: string; lastName: string; email: string;
  phone: string; address: string; city: string;
  state: string; zip: string; country: string;
};

type FlutterwaveResponse = {
  status: string; transaction_id?: number; tx_ref: string; flw_ref?: string;
};

const loadFlutterwaveScript = (): Promise<void> =>
  new Promise((resolve) => {
    if (document.getElementById("flutterwave-script")) { resolve(); return; }
    const script = document.createElement("script");
    script.id = "flutterwave-script";
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });

const COUNTRIES = [
  "United States","United Kingdom","Nigeria","Ghana","Kenya",
  "South Africa","Canada","Australia","Germany","France",
  "India","Brazil","UAE","Singapore","Netherlands",
  "Italy","Spain","Sweden","Norway","Japan",
];

const SHIPPING_OPTIONS = [
  { id: "standard",  label: "Standard Shipping", sub: "5–7 business days", price: 0,     display: "Free"   },
  { id: "express",   label: "Express Shipping",   sub: "2–3 business days", price: 9.99,  display: "$9.99"  },
  { id: "overnight", label: "Overnight Shipping", sub: "Next business day", price: 24.99, display: "$24.99" },
];

const COUNTRY_CURRENCY: Record<string, { code: string; symbol: string; rate: number }> = {
  "United States":  { code: "USD", symbol: "$",   rate: 1      },
  "United Kingdom": { code: "GBP", symbol: "£",   rate: 0.79   },
  "Nigeria":        { code: "NGN", symbol: "₦",   rate: 1600   },
  "Ghana":          { code: "GHS", symbol: "₵",   rate: 15.5   },
  "Kenya":          { code: "KES", symbol: "KSh", rate: 130    },
  "South Africa":   { code: "ZAR", symbol: "R",   rate: 18.5   },
  "Canada":         { code: "CAD", symbol: "C$",  rate: 1.37   },
  "Australia":      { code: "AUD", symbol: "A$",  rate: 1.54   },
  "Germany":        { code: "EUR", symbol: "€",   rate: 0.92   },
  "France":         { code: "EUR", symbol: "€",   rate: 0.92   },
  "India":          { code: "INR", symbol: "₹",   rate: 83     },
  "Brazil":         { code: "BRL", symbol: "R$",  rate: 5.1    },
  "UAE":            { code: "AED", symbol: "د.إ", rate: 3.67   },
  "Singapore":      { code: "SGD", symbol: "S$",  rate: 1.35   },
  "Netherlands":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "Italy":          { code: "EUR", symbol: "€",   rate: 0.92   },
  "Spain":          { code: "EUR", symbol: "€",   rate: 0.92   },
  "Sweden":         { code: "SEK", symbol: "kr",  rate: 10.5   },
  "Norway":         { code: "NOK", symbol: "kr",  rate: 10.7   },
  "Japan":          { code: "JPY", symbol: "¥",   rate: 150    },
};

// Official Flutterwave test cards – https://developer.flutterwave.com/docs/integration-guides/testing-helpers
const TEST_CARDS = [
  {
    flag: "🇬🇧", currency: "GBP", label: "UK Pounds — Visa",
    number: "4187427415564246", expiry: "09/32", cvv: "828", pin: "3310", otp: "12345",
    note: "International GBP card — select United Kingdom as your country",
  },
  {
    flag: "🇺🇸", currency: "USD", label: "US Dollar — Mastercard",
    number: "5531886652142950", expiry: "09/32", cvv: "564", pin: "3310", otp: "12345",
    note: "USD international card",
  },
  {
    flag: "🇳🇬", currency: "NGN", label: "Nigeria — Mastercard",
    number: "5438898014560229", expiry: "10/31", cvv: "564", pin: "3310", otp: "12345",
    note: "NGN — unlocks USSD, Bank Account & Bank Transfer tabs",
  },
  {
    flag: "🇬🇭", currency: "GHS", label: "Ghana — Visa",
    number: "4111111111111111", expiry: "01/26", cvv: "956", pin: "3310", otp: "12345",
    note: "GHS — unlocks Mobile Money & Bank Transfer tabs",
  },
  {
    flag: "🌍", currency: "Any", label: "3D Secure — Visa (triggers OTP)",
    number: "4556052704172643", expiry: "01/31", cvv: "899", pin: "3310", otp: "12345",
    note: "Use any currency — will ask for OTP: 12345",
  },
];

const PAYMENT_META: Record<string, { emoji: string; label: string }> = {
  card:         { emoji: "💳", label: "Card"          },
  applepay:     { emoji: "🍎", label: "Apple Pay"     },
  mobilemoney:  { emoji: "📱", label: "Mobile Money"  },
  ussd:         { emoji: "🔢", label: "USSD"          },
  banktransfer: { emoji: "🏦", label: "Bank Transfer" },
  account:      { emoji: "🏛️", label: "Bank Account"  },
};

const TestCardsPanel = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };
  return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl overflow-hidden mb-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🧪</span>
          <div>
            <p className="text-xs font-black text-gray-700">Test Mode — Sample Cards</p>
            <p className="text-[10px] text-gray-400">Click to reveal • tap any value to copy</p>
          </div>
        </div>
        <FiChevronDown
          size={15}
          className="text-gray-400 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="border-t border-dashed border-gray-300 divide-y divide-gray-200">
          {TEST_CARDS.map((card) => (
            <div key={card.number} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{card.flag}</span>
                  <p className="text-xs font-black text-gray-800">{card.label}</p>
                </div>
                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-bold">{card.currency}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Card Number", val: card.number },
                  { label: "Expiry",      val: card.expiry },
                  { label: "CVV",         val: card.cvv    },
                  { label: "PIN",         val: card.pin    },
                  { label: "OTP",         val: card.otp    },
                ].map(({ label, val }) => {
                  const k = card.number + label;
                  return (
                    <button
                      key={k}
                      onClick={() => copy(val, k)}
                      className="flex items-center justify-between bg-white border border-gray-200 hover:border-black rounded-lg px-2.5 py-1.5 text-left transition-colors group"
                    >
                      <div>
                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-0.5">{label}</p>
                        <p className="text-xs font-black text-black font-mono tracking-wider">{val}</p>
                      </div>
                      {copied === k
                        ? <FiCheck size={11} className="text-green-500 shrink-0" />
                        : <FiCopy  size={11} className="text-gray-300 group-hover:text-black shrink-0 transition-colors" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 italic">{card.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Field = ({
  label, value, onChange, placeholder, type = "text",
  icon, required = true, colSpan = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; icon?: React.ReactNode;
  required?: boolean; colSpan?: boolean;
}) => (
  <div className={colSpan ? "sm:col-span-2" : ""}>
    <label className="text-xs font-black text-gray-700 mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full border border-gray-200 rounded-xl py-3 text-sm outline-none focus:border-black transition-colors ${icon ? "pl-10 pr-4" : "px-4"}`}
      />
    </div>
  </div>
);

const SuccessModal = ({
  orderNum, total, currencySymbol, currencyCode, onContinue, onViewHistory,
}: {
  orderNum: string; total: string; currencySymbol: string;
  currencyCode: string; onContinue: () => void; onViewHistory: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
      style={{ animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <div className="bg-black pt-8 pb-10 flex flex-col items-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-white/10" />
          <div className="absolute w-24 h-24 rounded-full border border-white/15" />
        </div>
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg relative z-10">
          <FiCheck size={30} className="text-black" strokeWidth={3} />
        </div>
        <p className="text-white font-black text-lg mt-4 relative z-10">Payment Successful!</p>
        <p className="text-white/70 text-xs mt-1 relative z-10">Your order has been confirmed</p>
      </div>
      <div className="px-6 py-5">
        <div className="text-center mb-5">
          <p className="text-3xl font-black text-black">{currencySymbol}{total}</p>
          <p className="text-xs text-gray-400 mt-0.5">{currencyCode}</p>
        </div>
        <div className="space-y-3 mb-6">
          {[
            { icon: <FiPackage size={14} />,       label: "Order Number", val: orderNum            },
            { icon: <HiOutlineTruck size={15} />,  label: "Est. Delivery",val: "5–7 Business Days" },
            { icon: <FiClock size={14} />,         label: "Status",       val: "Processing"        },
          ].map(({ icon, label, val }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2 text-gray-500">{icon}<span className="text-xs font-semibold">{label}</span></div>
              <span className={`text-xs font-black ${label === "Status" ? "text-black bg-gray-100 px-2.5 py-1 rounded-full" : "text-black"}`}>{val}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2.5">
          <button onClick={onViewHistory}
            className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <FiClock size={15} /> View Transaction History
          </button>
          <button onClick={onContinue}
            className="w-full border-2 border-gray-200 hover:border-black text-gray-700 hover:text-black font-black py-3 rounded-xl text-sm transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
    <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.85) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
  </div>
);

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useShop();
  const { discount = 0, couponCode = null } = (location.state as { discount?: number; couponCode?: string | null; }) ?? {};

  const [shippingMethod, setShippingMethod] = useState(SHIPPING_OPTIONS[0]);
  const [info, setInfo] = useState<ShippingInfo>({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "United States",
  });
  const [loading, setLoading]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderNum, setOrderNum]   = useState("");
  const [paidTotal, setPaidTotal] = useState("");
  const [txRef] = useState(`SHOP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`);

  const currency   = COUNTRY_CURRENCY[info.country] ?? COUNTRY_CURRENCY["United States"];
  const totalUSD   = cartTotal - discount + shippingMethod.price;
  const totalLocal = parseFloat((totalUSD * currency.rate).toFixed(2));
  const isValid    = info.firstName && info.lastName && info.email && info.phone && info.address && info.city && info.zip;

  // Build payment_options based on currency — only valid methods per currency are shown
  const getPaymentOptions = (): string => {
    const code = currency.code;
    const opts: string[] = ["card"];
    if (["USD","GBP","EUR"].includes(code))                             opts.push("applepay");
    if (["NGN"].includes(code))                                         opts.push("account","ussd","banktransfer");
    if (["GHS","KES","ZAR","UGX","RWF","ZMW","TZS"].includes(code))    opts.push("mobilemoney","banktransfer");
    if (["USD","GBP","EUR","CAD","AUD"].includes(code) && !["NGN"].includes(code)) opts.push("banktransfer");
    return [...new Set(opts)].join(",");
  };

  const handlePayment = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await loadFlutterwaveScript();
      // @ts-ignore
      FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-1846f466dad001520b9bf6345d69c9cb-X",
        tx_ref: txRef,
        amount: totalLocal,
        currency: currency.code,
        payment_options: getPaymentOptions(),
        customer: { email: info.email, phone_number: info.phone, name: `${info.firstName} ${info.lastName}` },
        customizations: {
          title: "My Shop",
          description: `Order for ${cart.length} item${cart.length !== 1 ? "s" : ""}`,
          logo: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=80",
        },
        meta: {
          shipping_address: `${info.address}, ${info.city}, ${info.state} ${info.zip}, ${info.country}`,
          coupon: couponCode ?? "none",
          items: cart.map((i) => `${i.name} x${i.quantity}`).join(", "),
        },
        callback: (response: FlutterwaveResponse) => {
          if (response.status === "successful" || response.status === "completed") {
            const num = `ORD-${response.transaction_id ?? Math.random().toString(36).slice(2,9).toUpperCase()}`;
            try {
              const existing = JSON.parse(localStorage.getItem("shop_transactions") ?? "[]");
              localStorage.setItem("shop_transactions", JSON.stringify([{
                id: num, txRef: response.tx_ref, flwRef: response.flw_ref,
                date: new Date().toISOString(), status: "successful",
                amount: totalLocal, currency: currency.code, currencySymbol: currency.symbol, amountUSD: totalUSD,
                items: cart.map((item) => ({ id: item.id, name: item.name, img: item.img, price: item.price,
                  quantity: item.quantity, selectedColor: item.selectedColor, selectedSize: item.selectedSize })),
                shippingAddress: `${info.address}, ${info.city}, ${info.state} ${info.zip}, ${info.country}`,
                shippingMethod: shippingMethod.label, coupon: couponCode ?? undefined,
                email: info.email, name: `${info.firstName} ${info.lastName}`,
              }, ...existing]));
            } catch { /* silent */ }
            setOrderNum(num);
            setPaidTotal(totalLocal.toLocaleString());
            clearCart();
            setShowModal(true);
          } else {
            alert("Payment was not completed. Please try again.");
          }
          setLoading(false);
        },
        onclose: () => setLoading(false),
      });
    } catch (err) { console.error(err); setLoading(false); }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      {showModal && (
        <SuccessModal orderNum={orderNum} total={paidTotal} currencySymbol={currency.symbol} currencyCode={currency.code}
          onContinue={() => { setShowModal(false); navigate("/"); }}
          onViewHistory={() => { setShowModal(false); navigate("/transactions"); }} />
      )}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-red-600 transition-colors font-medium">Home</Link>
          <FiChevronRight size={13} className="text-gray-400" />
          <Link to="/cart" className="hover:text-red-600 transition-colors font-medium">Cart</Link>
          <FiChevronRight size={13} className="text-gray-400" />
          <span className="font-bold text-gray-800">Checkout</span>
        </nav>
        <h1 className="text-xl font-black text-black mb-6">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT */}
          <div className="flex-1 space-y-5">

            {/* 1 Shipping */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
                <h2 className="font-black text-base text-black">Shipping Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name"        value={info.firstName} onChange={(v) => setInfo({...info,firstName:v})} placeholder="John"                  icon={<FiUser size={14} />} />
                <Field label="Last Name"          value={info.lastName}  onChange={(v) => setInfo({...info,lastName:v})}  placeholder="Doe"                   icon={<FiUser size={14} />} />
                <Field label="Email Address"      value={info.email}     onChange={(v) => setInfo({...info,email:v})}     placeholder="john@example.com" type="email" icon={<FiMail size={14} />} />
                <Field label="Phone Number"       value={info.phone}     onChange={(v) => setInfo({...info,phone:v})}     placeholder="+1 234 567 890" type="tel" icon={<FiPhone size={14} />} />
                <Field label="Street Address"     value={info.address}   onChange={(v) => setInfo({...info,address:v})}   placeholder="123 Main Street" icon={<FiMapPin size={14} />} colSpan />
                <Field label="City"               value={info.city}      onChange={(v) => setInfo({...info,city:v})}      placeholder="New York" />
                <Field label="State / Province"   value={info.state}     onChange={(v) => setInfo({...info,state:v})}     placeholder="NY" required={false} />
                <Field label="ZIP / Postal Code"  value={info.zip}       onChange={(v) => setInfo({...info,zip:v})}       placeholder="10001" />
                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-gray-700 mb-1.5 block">Country <span className="text-red-500">*</span></label>
                  <select value={info.country} onChange={(e) => setInfo({...info,country:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white">
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    💱 Charged in <strong className="text-gray-600">{currency.code}</strong> ({currency.symbol})
                  </p>
                </div>
              </div>
            </div>

            {/* 2 Shipping method */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
                <h2 className="font-black text-base text-black">Shipping Method</h2>
              </div>
              <div className="space-y-2">
                {SHIPPING_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setShippingMethod(opt)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${shippingMethod.id === opt.id ? "border-black bg-black/[0.02]" : "border-gray-100 hover:border-gray-300"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${shippingMethod.id === opt.id ? "border-black" : "border-gray-300"}`}>
                      {shippingMethod.id === opt.id && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.sub}</p>
                    </div>
                    <span className={`text-sm font-black shrink-0 ${opt.price === 0 ? "text-green-600" : "text-black"}`}>{opt.display}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shrink-0">3</div>
                <h2 className="font-black text-base text-black">Payment</h2>
              </div>

              <TestCardsPanel />

              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-xs">FW</span>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">Secured by Flutterwave</p>
                  <p className="text-xs text-gray-500">Options shown based on selected country/currency</p>
                </div>
              </div>

              {/* Dynamic options preview */}
              <div className="mb-5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Available for {currency.code}</p>
                <div className="flex flex-wrap gap-2">
                  {getPaymentOptions().split(",").map((opt) => {
                    const meta = PAYMENT_META[opt.trim()];
                    if (!meta) return null;
                    return (
                      <div key={opt} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                        <span className="text-sm">{meta.emoji}</span>
                        <span className="text-xs font-bold text-gray-700">{meta.label}</span>
                      </div>
                    );
                  })}
                </div>
                {["USD","GBP","EUR"].includes(currency.code) && (
                  <p className="text-[10px] text-gray-400 mt-2">🍎 Apple Pay appears on Safari/iOS only</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                <FiLock size={12} className="text-black shrink-0" />
                <span>256-bit SSL encrypted. Your payment details are never stored.</span>
              </div>

              <button onClick={handlePayment} disabled={!isValid || loading}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all ${
                  !isValid ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : loading ? "bg-black text-white opacity-70 cursor-wait"
                  : "bg-black hover:bg-gray-800 text-white"}`}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Opening payment…</>
                ) : (
                  <><FiLock size={15} />Pay {currency.symbol}{totalLocal.toLocaleString()} {currency.code}</>
                )}
              </button>

              {!isValid && <p className="text-xs text-red-400 text-center mt-2">Please fill in all required fields above.</p>}

              <Link to="/cart" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-black font-semibold transition-colors mt-3">
                <FiArrowLeft size={13} /> Back to Cart
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h2 className="font-black text-sm text-black mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={item.img} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white text-[9px] rounded-full flex items-center justify-center font-black">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                      {item.selectedColor && <p className="text-[10px] text-gray-400">{item.selectedColor}{item.selectedSize ? ` · ${item.selectedSize}` : ""}</p>}
                    </div>
                    <span className="text-xs font-black text-black shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold">${cartTotal.toFixed(2)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold">Coupon ({couponCode})</span>
                    <span className="font-semibold text-green-600">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-semibold ${shippingMethod.price === 0 ? "text-green-600" : "text-black"}`}>
                    {shippingMethod.price === 0 ? "Free" : `$${shippingMethod.price.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                  <span className="font-black text-black">Total (USD)</span>
                  <span className="font-black text-black">${totalUSD.toFixed(2)}</span>
                </div>
                {currency.code !== "USD" && (
                  <div className="flex justify-between text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <span className="text-gray-600 font-semibold">Charged as</span>
                    <span className="font-black text-black">{currency.symbol}{totalLocal.toLocaleString()} {currency.code}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400">
                <FiLock size={11} /><span className="text-[10px]">Payments secured by</span>
                <span className="text-[10px] font-black text-black">Flutterwave</span>
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