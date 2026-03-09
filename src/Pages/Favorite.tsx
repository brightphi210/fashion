import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft, FiChevronRight } from "react-icons/fi";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { useShop } from "../providers/ShopContext";

const Favourite = () => {
  const { favourites, removeFromFavourites, addToCart, isInCart } = useShop();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-red-600 transition-colors font-medium">Home</Link>
          <FiChevronRight size={13} className="text-gray-400" />
          <span className="font-bold text-gray-800">Favourites</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiHeart className="text-red-500" size={22} />
            <h1 className="text-xl font-black text-black">
              My Favourites{" "}
              <span className="text-gray-400 font-semibold text-base">
                ({favourites.length})
              </span>
            </h1>
          </div>
          {favourites.length > 0 && (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiArrowLeft size={14} />
              Continue Shopping
            </Link>
          )}
        </div>

        {/* Empty state */}
        {favourites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <FiHeart size={36} className="text-red-300" />
            </div>
            <h2 className="text-lg font-black text-gray-800 mb-1">No favourites yet</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Save items you love by tapping the heart icon on any product.
            </p>
            <Link
              to="/"
              className="bg-black hover:bg-red-600 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favourites.map((product) => {
              const inCart = isInCart(product.id);
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {product.tag && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-md">
                          {product.tag}
                        </span>
                      )}
                      {product.discount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-md">
                          -{product.discount}%
                        </span>
                      )}

                      {/* Remove from favourites */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromFavourites(product.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 hover:bg-red-50 transition-all group/btn"
                        title="Remove from favourites"
                      >
                        <FiHeart
                          size={15}
                          className="fill-red-500 text-red-500 group-hover/btn:fill-none transition-all"
                        />
                      </button>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <Link to={`/product/${product.id}`}>
                      <p className="text-sm font-bold text-gray-900 truncate hover:text-red-600 transition-colors">
                        {product.name}
                      </p>
                    </Link>

                    {/* Colors preview */}
                    {product.colors?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {product.colors.join(" · ")}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 mb-3">
                      <span className="text-sm font-black text-black">${product.price.toFixed(2)}</span>
                      {product.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ${product.oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-colors ${
                          inCart
                            ? "bg-green-500 text-white"
                            : "bg-black hover:bg-red-600 text-white"
                        }`}
                      >
                        <FiShoppingCart size={13} />
                        {inCart ? "In Cart" : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => removeFromFavourites(product.id)}
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors shrink-0"
                        title="Remove"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Favourite;