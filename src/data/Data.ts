// ─── Shared Types ─────────────────────────────────────────────────────────────

export type Video = {
  id: number;
  thumb: string;
  duration: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  oldPrice: number | null;
  tag: string | null;
  discount: number | null;
  img: string;
  images: string[];
  liked: boolean;
  category: string;   // slug: "hoodie", "jacket", "clothing", etc.
  colors: string[];
  sizes: string[];
  description: string;
  videos: Video[];
};

export type Category = {
  label: string;
  slug: string;
  img: string;
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories: Category[] = [
  { label: "Clothing",    slug: "clothing",    img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80" },
  { label: "Hoodie",      slug: "hoodie",      img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=300&q=80" },
  { label: "Jacket",      slug: "jacket",      img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80" },
  { label: "Pants",       slug: "pants",       img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&q=80" },
  { label: "Accessories", slug: "accessories", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80" },
  { label: "Sports Wear", slug: "sports-wear", img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&q=80" },
  { label: "Footwear",    slug: "footwear",    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80" },
  { label: "Hats",        slug: "hats",        img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300&q=80" },
];

// ─── Shared video sets (reused across products) ────────────────────────────────

const clothingVideos: Video[] = [
  { id: 1, thumb: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80",   duration: "2:34" },
  { id: 2, thumb: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80", duration: "1:58" },
  { id: 3, thumb: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80", duration: "3:12" },
];

const footwearVideos: Video[] = [
  { id: 1, thumb: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",   duration: "2:11" },
  { id: 2, thumb: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80", duration: "3:45" },
  { id: 3, thumb: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80", duration: "1:29" },
];

const jacketVideos: Video[] = [
  { id: 1, thumb: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80",   duration: "2:50" },
  { id: 2, thumb: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",   duration: "1:44" },
  { id: 3, thumb: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=400&q=80", duration: "3:07" },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: 1,
    name: "Hoodie Gray",
    price: 60,
    oldPrice: 80,
    tag: "Flash Sale",
    discount: null,
    img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80",
    ],
    liked: false,
    category: "hoodie",
    colors: ["Gray", "Black", "White"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "A premium quality gray hoodie made from soft cotton blend. Perfect for casual wear and outdoor activities. Features a kangaroo pocket and adjustable drawstring hood.",
    videos: clothingVideos,
  },
  {
    id: 2,
    name: "705 Black Shirt",
    price: 25,
    oldPrice: null,
    tag: null,
    discount: null,
    img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
    ],
    liked: false,
    category: "clothing",
    colors: ["Black", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Classic black shirt with a modern slim fit. Crafted from breathable cotton for all-day comfort. A wardrobe essential for every occasion.",
    videos: clothingVideos,
  },
  {
    id: 3,
    name: "Slim Navy Shirt",
    price: 40.99,
    oldPrice: 59.99,
    tag: "Flash Sale",
    discount: null,
    img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    ],
    liked: true,
    category: "clothing",
    colors: ["Navy", "Blue", "White"],
    sizes: ["S", "M", "L"],
    description:
      "Slim-fit navy shirt perfect for both casual and semi-formal settings. Made from premium cotton with a smooth finish that keeps you looking sharp all day.",
    videos: clothingVideos,
  },
  {
    id: 4,
    name: "Leather Bomber Jacket",
    price: 125,
    oldPrice: null,
    tag: null,
    discount: null,
    img: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80",
    ],
    liked: true,
    category: "jacket",
    colors: ["Brown", "Black"],
    sizes: ["M", "L", "XL"],
    description:
      "Genuine leather bomber jacket with a classic silhouette. Features ribbed cuffs, collar, and hem. A timeless investment piece that gets better with age.",
    videos: jacketVideos,
  },
  {
    id: 5,
    name: "Beach Hat",
    price: 40,
    oldPrice: 50,
    tag: "Flash Sale",
    discount: null,
    img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80",
      "https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=600&q=80",
    ],
    liked: false,
    category: "hats",
    colors: ["Beige", "White", "Black"],
    sizes: ["S", "M", "L"],
    description:
      "Wide brim beach hat crafted from natural straw material. Provides excellent UV protection while keeping you stylish at the beach or pool.",
    videos: clothingVideos,
  },
  {
    id: 6,
    name: "Sneakers Brown Nike",
    price: 250,
    oldPrice: null,
    tag: null,
    discount: null,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    ],
    liked: false,
    category: "footwear",
    colors: ["Brown", "White", "Orange"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    description:
      "Premium sneakers with advanced cushioning technology. Designed for both performance and everyday style. The durable outsole provides excellent grip on all surfaces.",
    videos: footwearVideos,
  },
  {
    id: 7,
    name: "Flannel Yellow Outer",
    price: 30,
    oldPrice: 39,
    tag: "Flash Sale",
    discount: 15,
    img: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=600&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      "https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=600&q=80",
    ],
    liked: false,
    category: "jacket",
    colors: ["Yellow", "Green", "Blue"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Soft flannel overshirt in a warm yellow tone. Perfect as a lightweight layer over tees. Features a relaxed fit and classic button-down design.",
    videos: jacketVideos,
  },
  {
    id: 8,
    name: "Outcast Shirt",
    price: 25,
    oldPrice: null,
    tag: null,
    discount: null,
    img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    ],
    liked: true,
    category: "clothing",
    colors: ["White", "Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Graphic print shirt with a bold design statement. Made from 100% cotton for maximum comfort. A streetwear staple that pairs well with jeans or joggers.",
    videos: clothingVideos,
  },
  {
    id: 9,
    name: "White Hoodie",
    price: 22,
    oldPrice: null,
    tag: "Flash Sale",
    discount: null,
    img: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&q=80",
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    ],
    liked: false,
    category: "hoodie",
    colors: ["White", "Cream"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Clean white hoodie with a minimal design. Made from a soft fleece-lined interior for extra warmth. The relaxed fit makes it ideal for lounging or casual outings.",
    videos: clothingVideos,
  },
  {
    id: 10,
    name: "Audere Hoodie",
    price: 30,
    oldPrice: 35,
    tag: "Flash Sale",
    discount: null,
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80",
    ],
    liked: false,
    category: "hoodie",
    colors: ["White", "Gray"],
    sizes: ["M", "L", "XL", "XXL"],
    description:
      "The Audere hoodie features a bold embroidered logo and premium heavyweight cotton. Designed for streetwear enthusiasts who want comfort and style in one piece.",
    videos: clothingVideos,
  },
  {
    id: 11,
    name: "Slim Fit Pants",
    price: 55,
    oldPrice: 70,
    tag: null,
    discount: 15,
    img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&q=80",
    ],
    liked: false,
    category: "pants",
    colors: ["Black", "Navy", "Gray"],
    sizes: ["28", "30", "32", "34", "36"],
    description:
      "Modern slim-fit pants with a tapered leg. Made from stretch fabric for ease of movement. Features five-pocket styling and a zip fly with button closure.",
    videos: clothingVideos,
  },
  {
    id: 12,
    name: "Running Shoes",
    price: 120,
    oldPrice: 150,
    tag: null,
    discount: null,
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    ],
    liked: false,
    category: "footwear",
    colors: ["White", "Red", "Black"],
    sizes: ["40", "41", "42", "43", "44"],
    description:
      "High-performance running shoes with responsive cushioning. Engineered mesh upper provides breathability while the rubber outsole delivers superior traction on any surface.",
    videos: footwearVideos,
  },
];