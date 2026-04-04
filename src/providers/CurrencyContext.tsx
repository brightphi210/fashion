import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CurrencyInfo {
    code: string;       // e.g. "NGN"
    symbol: string;     // e.g. "₦"
    rate: number;       // exchange rate relative to USD
    countryCode: string; // ISO 2-letter e.g. "NG"
    countryName: string;
    flag: string;       // emoji flag
}

interface CurrencyContextValue {
    currency: CurrencyInfo;
    setCurrency: (c: CurrencyInfo) => void;
    convert: (usdPrice: number) => string;
    isLoading: boolean;
}

const DEFAULT: CurrencyInfo = {
    code: "USD",
    symbol: "$",
    rate: 1,
    countryCode: "US",
    countryName: "United States",
    flag: "🇺🇸",
};

const STORAGE_KEY = "shop_currency";

const CurrencyContext = createContext<CurrencyContextValue>({
    currency: DEFAULT,
    setCurrency: () => { },
    convert: (p) => `$${p.toFixed(2)}`,
    isLoading: false,
});

const EXCHANGE_API = "https://api.exchangerate-api.com/v4/latest/USD";

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrencyState] = useState<CurrencyInfo>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT;
        } catch {
            return DEFAULT;
        }
    });
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch exchange rates once on mount
    useEffect(() => {
        setIsLoading(true);
        fetch(EXCHANGE_API)
            .then((r) => r.json())
            .then((data) => {
                if (data?.rates) {
                    setRates(data.rates);
                    // Update rate for currently selected currency
                    setCurrencyState((prev) => ({
                        ...prev,
                        rate: data.rates[prev.code] ?? 1,
                    }));
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const setCurrency = useCallback(
        (info: CurrencyInfo) => {
            const updated = { ...info, rate: rates[info.code] ?? 1 };
            setCurrencyState(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        },
        [rates]
    );

    const convert = useCallback(
        (usdPrice: number): string => {
            const converted = usdPrice * currency.rate;
            // Format large numbers nicely (e.g. NGN)
            if (converted >= 1000) {
                return `${currency.symbol}${converted.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                })}`;
            }
            return `${currency.symbol}${converted.toFixed(2)}`;
        },
        [currency]
    );

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convert, isLoading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);