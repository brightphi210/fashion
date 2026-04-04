import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { type CurrencyInfo, useCurrency } from "../providers/CurrencyContext";

// ── types from REST Countries ──────────────────────────────────────────────
interface RestCountry {
    name: { common: string };
    cca2: string;
    flag: string;   // emoji
    currencies?: Record<string, { name: string; symbol: string }>;
}

interface CountryOption {
    countryCode: string;
    countryName: string;
    flag: string;
    code: string;   // currency code
    symbol: string;
}

const COUNTRIES_API =
    "https://restcountries.com/v3.1/all?fields=name,cca2,flag,currencies";

const cache: { data: CountryOption[] | null } = { data: null };

const fetchCountries = async (): Promise<CountryOption[]> => {
    if (cache.data) return cache.data;
    const res = await fetch(COUNTRIES_API);
    const raw: RestCountry[] = await res.json();

    const result: CountryOption[] = raw
        .filter((c) => c.currencies && Object.keys(c.currencies).length > 0)
        .flatMap((c) =>
            Object.entries(c.currencies!).map(([code, cur]) => ({
                countryCode: c.cca2,
                countryName: c.name.common,
                flag: c.flag,
                code,
                symbol: cur.symbol ?? code,
            }))
        )
        .sort((a, b) => a.countryName.localeCompare(b.countryName));

    cache.data = result;
    return result;
};

export const CurrencySelector = () => {
    const { currency, setCurrency } = useCurrency();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState<CountryOption[]>([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Load countries when dropdown opens for the first time
    useEffect(() => {
        if (!open || options.length > 0) return;
        setLoading(true);
        fetchCountries()
            .then(setOptions)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [open]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = search.trim()
        ? options.filter(
            (o) =>
                o.countryName.toLowerCase().includes(search.toLowerCase()) ||
                o.code.toLowerCase().includes(search.toLowerCase())
        )
        : options;

    const handleSelect = (opt: CountryOption) => {
        const info: CurrencyInfo = {
            code: opt.code,
            symbol: opt.symbol,
            rate: 1, // will be overridden by CurrencyProvider
            countryCode: opt.countryCode,
            countryName: opt.countryName,
            flag: opt.flag,
        };
        setCurrency(info);
        setOpen(false);
        setSearch("");
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Trigger button */}
            <button
                onClick={() => setOpen((v) => !v)}
                title="Change currency"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: "1.5px solid rgba(0,0,0,0.1)",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "inherit",
                    transition: "background 0.15s",
                    whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)")
                }
                onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
            >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{currency.flag}</span>
                <span style={{ fontSize: 12 }}>{currency.code}</span>
                <FiChevronDown
                    size={11}
                    style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                />
            </button>

            {/* Dropdown */}
            <div
                style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 260,
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
                    border: "1px solid rgba(0,0,0,0.07)",
                    zIndex: 200,
                    overflow: "hidden",
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(-8px)",
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
            >
                {/* Search box */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 12px",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    <FiSearch size={13} style={{ color: "#999", flexShrink: 0 }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search country or currency..."
                        autoFocus={open}
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: 12,
                            background: "transparent",
                            color: "#333",
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                color: "#bbb",
                                display: "flex",
                            }}
                        >
                            <FiX size={12} />
                        </button>
                    )}
                </div>

                {/* List */}
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                    {loading ? (
                        <div
                            style={{
                                padding: "20px 0",
                                textAlign: "center",
                                fontSize: 12,
                                color: "#999",
                            }}
                        >
                            Loading countries…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div
                            style={{
                                padding: "20px 0",
                                textAlign: "center",
                                fontSize: 12,
                                color: "#999",
                            }}
                        >
                            No results
                        </div>
                    ) : (
                        filtered.map((opt) => {
                            const active =
                                opt.code === currency.code &&
                                opt.countryCode === currency.countryCode;
                            return (
                                <button
                                    key={`${opt.countryCode}-${opt.code}`}
                                    onClick={() => handleSelect(opt)}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "8px 14px",
                                        border: "none",
                                        background: active ? "#fff5f5" : "transparent",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "background 0.12s",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active)
                                            (e.currentTarget as HTMLElement).style.background =
                                                "#f9f9f9";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.background = active
                                            ? "#fff5f5"
                                            : "transparent";
                                    }}
                                >
                                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                                        {opt.flag}
                                    </span>
                                    <span
                                        style={{
                                            flex: 1,
                                            fontSize: 12,
                                            color: "#222",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {opt.countryName}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: active ? "#e53e3e" : "#888",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {opt.code}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};