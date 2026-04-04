import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmailCaptureModal from "../component/EmailCaptureModal";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import ProductCard, { ProductCardSkeleton } from "../component/ProductCard";
import { useGetCategories, useGetProducts } from "../hooks/mutations/allMutation";

const Home = () => {
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { categories, isLoading: isCategoriesLoading } = useGetCategories();
  const rawCategories = categories?.data ?? [];
  const allCategories: any[] = Array.isArray(rawCategories) ? rawCategories : [];

  const { products, isLoading: isProductsLoading } = useGetProducts();
  const rawProducts = products?.data ?? [];
  const allProducts: any[] = Array.isArray(rawProducts) ? rawProducts : [];

  const scrollCategories = (dir: "left" | "right") => {
    categoryScrollRef.current?.scrollBy({
      left: dir === "left" ? -180 : 180,
      behavior: "smooth",
    });
  };

  const handleFilterClick = (filter: string) => {
    navigate(`/search?q=${encodeURIComponent(filter.toLowerCase())}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <EmailCaptureModal />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />


      <div className="max-w-5xl mx-auto px-4 pb-0">

        {/* ── Browse By Category ── */}
        <section className="mb-10 pt-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2
                className="text-xl font-extrabold text-black tracking-tight leading-none"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Shop by Category
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                Find exactly what you're looking for
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCategories("left")}
                className="w-8 h-8 rounded-full border-[1.5px] border-gray-200 bg-white flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all duration-200 text-gray-600"
              >
                <FiChevronLeft size={13} />
              </button>
              <button
                onClick={() => scrollCategories("right")}
                className="w-8 h-8 rounded-full border-[1.5px] border-gray-200 bg-white flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all duration-200 text-gray-600"
              >
                <FiChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={categoryScrollRef}
              className="flex gap-2.5 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {isCategoriesLoading
                ? [...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0 rounded-xl overflow-hidden animate-pulse bg-gray-200"
                    style={{ width: 88, aspectRatio: "3/4" }}
                  />
                ))
                : allCategories
                  .filter((cat: any) => cat && typeof cat === "object" && cat.slug)
                  .map((cat: any) => (
                    <button
                      key={cat.slug}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(cat.slug)}`)}
                      className="group shrink-0 rounded-xl overflow-hidden cursor-pointer block text-left"
                      style={{
                        width: 88,
                        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.transform = "translateY(-3px)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")
                      }
                    >
                      <div
                        className="relative overflow-hidden bg-gray-100"
                        style={{ aspectRatio: "3/4" }}
                      >
                        <img
                          src={cat.img}
                          alt={cat.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)",
                          }}
                        />
                        <span
                          className="absolute bottom-2 left-0 right-0 text-center text-white text-[10px] font-bold px-1 tracking-wide"
                          style={{
                            fontFamily: "'Syne', sans-serif",
                            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                          }}
                        >
                          {cat.label}
                        </span>
                        {cat.count && (
                          <span className="absolute top-1.5 right-1.5 bg-white/90 text-black text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                            {cat.count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
            </div>

            <div
              className="absolute right-0 top-0 bottom-2 w-12 pointer-events-none z-10"
              style={{
                background: "linear-gradient(to right, transparent, #f9fafb)",
              }}
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex gap-2 flex-wrap mt-4">
            {["All", "New In", "Sale", "Trending", "Under $50"].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter === "All" ? "" : filter)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border-[1.5px] border-gray-200 bg-white text-gray-500 hover:bg-black hover:border-black hover:text-white transition-all duration-150"
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* ── New Arrivals ── */}
        <section className="pb-16">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineFire className="text-red-500" size={22} />
            <h2 className="text-lg font-black text-black">New Arrival</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {isProductsLoading
              ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
              : allProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
