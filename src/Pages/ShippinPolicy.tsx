import { FiChevronRight } from "react-icons/fi";
import { HiOutlineTruck } from "react-icons/hi";
import { Link } from "react-router-dom";
import camo from "../assets/camo.jpg";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";

const ShippingPolicy = () => {
    return (
        <div
            className="min-h-screen relative"
            style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
        >
            <div className="fixed inset-0 z-0 pointer-events-none bg-black/80" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-[rgba(201,185,154,0.4)] mb-6">
                        <Link to="/" className="hover:text-[#c9b99a] transition-colors">Home</Link>
                        <FiChevronRight size={11} />
                        <span className="text-[#c9b99a] font-bold">Shipping Policy</span>
                    </nav>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-[3px] h-6 bg-[#c9b99a] shrink-0" />
                        <h1 className="text-base font-black text-[#c9b99a] tracking-widest uppercase">
                            Shipping Policy
                        </h1>
                        <HiOutlineTruck size={22} className="ml-auto text-[rgba(201,185,154,0.2)]" />
                    </div>

                    {/* Delivery Times */}
                    <div className="border border-[rgba(201,185,154,0.12)] mb-4">
                        <div className="px-5 py-3 border-b border-[rgba(201,185,154,0.1)] bg-[rgba(201,185,154,0.04)]">
                            <p className="text-[11px] font-black text-[#c9b99a] tracking-widest uppercase">Delivery Times</p>
                        </div>
                        <div className="divide-y divide-[rgba(201,185,154,0.08)]">
                            <div className="flex items-center justify-between px-5 py-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🇬🇧</span>
                                    <div>
                                        <p className="text-[12px] font-black text-[#c9b99a] tracking-wide uppercase">UK / Ireland</p>
                                        <p className="text-[11px] text-[rgba(201,185,154,0.4)] mt-0.5">Domestic shipping</p>
                                    </div>
                                </div>
                                <span className="text-[12px] font-black text-[#c9b99a] bg-[rgba(201,185,154,0.08)] border border-[rgba(201,185,154,0.15)] px-3 py-1.5 tracking-wide shrink-0">
                                    6–10 Working Days
                                </span>
                            </div>
                            <div className="flex items-center justify-between px-5 py-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🌍</span>
                                    <div>
                                        <p className="text-[12px] font-black text-[#c9b99a] tracking-wide uppercase">International</p>
                                        <p className="text-[11px] text-[rgba(201,185,154,0.4)] mt-0.5">Rest of world</p>
                                    </div>
                                </div>
                                <span className="text-[12px] font-black text-[#c9b99a] bg-[rgba(201,185,154,0.08)] border border-[rgba(201,185,154,0.15)] px-3 py-1.5 tracking-wide shrink-0">
                                    6–15 Working Days
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="border border-[rgba(201,185,154,0.12)] mb-4">
                        <div className="px-5 py-3 border-b border-[rgba(201,185,154,0.1)] bg-[rgba(201,185,154,0.04)]">
                            <p className="text-[11px] font-black text-[#c9b99a] tracking-widest uppercase">Important Information</p>
                        </div>
                        <div className="divide-y divide-[rgba(201,185,154,0.08)]">

                            {/* Import Taxes */}
                            <div className="px-5 py-4 flex gap-4">
                                <span className="w-5 h-5 bg-[#c9b99a] text-[#28251e] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <div>
                                    <p className="text-[12px] font-black text-[#c9b99a] tracking-wide uppercase mb-1">Import Taxes</p>
                                    <p className="text-[13px] text-[rgba(201,185,154,0.6)] leading-relaxed">
                                        It is the customer's responsibility to pay any import taxes upon delivery.
                                        Regulations for import duties and taxes may vary by country — we are unable
                                        to control or predict their amount.
                                    </p>
                                </div>
                            </div>

                            {/* Refused Shipments */}
                            <div className="px-5 py-4 flex gap-4">
                                <span className="w-5 h-5 bg-[#c9b99a] text-[#28251e] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <div>
                                    <p className="text-[12px] font-black text-[#c9b99a] tracking-wide uppercase mb-1">Refused Shipments</p>
                                    <p className="text-[13px] text-[rgba(201,185,154,0.6)] leading-relaxed">
                                        If you refuse a shipment from us, you are responsible for the original
                                        shipping charges as well as any return courier costs incurred.
                                    </p>
                                </div>
                            </div>

                            {/* Customs Delays */}
                            <div className="px-5 py-4 flex gap-4">
                                <span className="w-5 h-5 bg-[#c9b99a] text-[#28251e] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                                <div>
                                    <p className="text-[12px] font-black text-[#c9b99a] tracking-wide uppercase mb-1">Customs Delays</p>
                                    <p className="text-[13px] text-[rgba(201,185,154,0.6)] leading-relaxed">
                                        International shipments may take longer to arrive due to the customs
                                        process in your country. This is outside of our control.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thank you note */}
                    <div className="border-l-2 border-[#c9b99a] pl-4 py-1">
                        <p className="text-[13px] text-[rgba(201,185,154,0.55)] leading-relaxed">
                            We appreciate your patience and your support of{" "}
                            <span className="text-[#c9b99a] font-bold">6ixUnit</span>.
                            If you have any questions about your shipment, reach us at{" "}

                            <a
                                href="mailto:support@6ixunit.store"
                                className="text-[#c9b99a] underline underline-offset-2 hover:opacity-70 transition-opacity"
                            >
                                6ixunit@gmail.com
                            </a>
                            . Thank you.
                        </p>
                    </div>

                </div>

                <Footer />
            </div>
        </div >
    );
};

export default ShippingPolicy;