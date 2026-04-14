import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import camo from "../assets/camo.jpg";
import EmailCaptureModal from "../component/EmailCaptureModal";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import ProductCard, { ProductCardSkeleton } from "../component/ProductCard";
import { useGetProducts } from "../hooks/mutations/allMutation";

const Home = () => {
  const { products, isLoading: isProductsLoading } = useGetProducts();
  const rawProducts = products?.data ?? [];
  const allProducts: any[] = Array.isArray(rawProducts) ? rawProducts : [];

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundImage: `url('${camo}')`, backgroundRepeat: "repeat", backgroundSize: "100%" }}
    >
      {/* Dark camo overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/60 h-full" />

      <div className="relative z-10">
        <Navbar />
        <EmailCaptureModal />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />

        <div className="max-w-5xl mx-auto px-4 pb-0">
          {/* New Arrivals */}
          <section className="pt-14 pb-16">

            {/* Section header */}
            {/* <div className="flex items-center gap-2.5 mb-6">
              <div className="w-0.75 h-5 bg-[#c9b99a]/55 rounded-sm" />
              <HiOutlineFire className="text-[#c9b99a]/55" size={20} />
              <h2 className="text-lg font-bold text-[#c9b99a]/55 tracking-[0.12em] uppercase m-0">
                New Arrival
              </h2>
              <div className="flex-1 h-px bg-[#c9b99a]/55/20" />
            </div> */}

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
    </div>
  );
};

export default Home;