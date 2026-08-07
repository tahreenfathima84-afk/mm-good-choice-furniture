const u = (id, w = 1600) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const IMAGES = {
  hero: u("photo-1618221195710-dd6b41faaea6", 2400),
  craft: u("photo-1586023492125-27b2c045efd7", 1200),
  living: u("photo-1616486338812-3dadae4b4ace", 1400),
  bedroom: u("photo-1616594039964-ae9021a400a0", 1400),
  dining: u("photo-1577140917170-285929fb55b7", 1400),
};

export const CATEGORIES = [
  { name: "Luxury Sofas", image: u("photo-1555041469-a586c61ea9bc", 900), count: "₹28,000 – ₹60,000" },
  { name: "Beds", image: u("photo-1505693416388-ac5ce068fe85", 900), count: "₹8,500 – ₹40,000" },
  { name: "Dining Tables", image: u("photo-1577140917170-285929fb55b7", 900), count: "₹16,000 – ₹35,000" },
  { name: "TV Units", image: u("photo-1616137466211-f939a420be84", 900), count: "₹16,000 – ₹30,000" },
  { name: "LCD Stands", image: u("photo-1595428774223-ef52624120d2", 900), count: "₹16,000 – ₹30,000" },
  { name: "Wardrobes", image: u("photo-1595526114035-0d45ed16cfbf", 900), count: "Custom Built" },
  { name: "Coffee Tables", image: u("photo-1594026112284-02bb6f3352fe", 900), count: "Premium Range" },
  { name: "Office Furniture", image: u("photo-1524758631624-e2822e304c36", 900), count: "Work From Home" },
  { name: "Storage Units", image: u("photo-1618220179428-22790b461013", 900), count: "Smart Storage" },
  { name: "Shoe Racks", image: u("photo-1533090481720-856c6e3c1fdc", 900), count: "₹2,000 – ₹7,000" },
  { name: "Custom Furniture", image: u("photo-1586023492125-27b2c045efd7", 900), count: "Made To Order" },
];

export const FALLBACK_PRODUCTS = [
  { product_id: "fb1", name: "Heritage Teak Dining Table", category: "Dining Tables", price_label: "₹16,000 – ₹35,000", description: "Six-seater solid teak dining table with hand-polished natural finish.", image: u("photo-1577140917170-285929fb55b7", 1200), sizes: [] },
  { product_id: "fb2", name: "Royal 3-Seater Fabric Sofa", category: "Luxury Sofas", price_label: "₹28,000 – ₹60,000", description: "Deep-cushioned premium fabric sofa on a seasoned hardwood frame.", image: u("photo-1555041469-a586c61ea9bc", 1200), sizes: [] },
  { product_id: "fb3", name: "Solid Wood King Bed", category: "Beds", price_label: "₹8,500 – ₹40,000", description: "Sturdy solid-wood bed with hydraulic storage option.", image: u("photo-1505693416388-ac5ce068fe85", 1200), sizes: ["4×6", "5×6.5", "6×6.5"] },
  { product_id: "fb4", name: "Modern TV Entertainment Unit", category: "TV Units", price_label: "₹16,000 – ₹30,000", description: "Wall-panelled TV unit with ambient shelving and drawers.", image: u("photo-1616137466211-f939a420be84", 1200), sizes: [] },
  { product_id: "fb5", name: "Classic LCD Stand", category: "LCD Stands", price_label: "₹16,000 – ₹30,000", description: "Compact wooden LCD stand with closed storage.", image: u("photo-1595428774223-ef52624120d2", 1200), sizes: [] },
  { product_id: "fb6", name: "Sliding Door Wardrobe", category: "Wardrobes", price_label: "Request Price", description: "Space-saving sliding wardrobe with mirror and lofts.", image: u("photo-1595526114035-0d45ed16cfbf", 1200), sizes: [] },
  { product_id: "fb7", name: "Compact Shoe Rack", category: "Shoe Racks", price_label: "₹2,000 – ₹7,000", description: "Ventilated multi-shelf wooden shoe rack.", image: u("photo-1600566753190-17f0baa2a6c3", 1200), sizes: [] },
  { product_id: "fb8", name: "Walnut Coffee Table", category: "Coffee Tables", price_label: "Request Price", "description": "Center coffee table in rich walnut tones.", image: u("photo-1594026112284-02bb6f3352fe", 1200), sizes: [] },
];

export const MANIFESTO = [
  { num: "01", title: "10+ Years of Craft", text: "A decade of shaping Bengaluru homes with furniture that outlives trends." },
  { num: "02", title: "Premium Quality Wood", text: "Seasoned, termite-treated hardwoods and finishes that age gracefully." },
  { num: "03", title: "Trusted by Families", text: "Generations of TC Palya and KR Puram families furnish their homes with us." },
  { num: "04", title: "Affordable Luxury", text: "Showroom-grade furniture at honest, neighbourhood prices." },
  { num: "05", title: "Custom Furniture", text: "Your space, your dimensions, your finish — built to order by our carpenters." },
  { num: "06", title: "Professional Service", text: "From first visit to final placement, one team owns your experience." },
  { num: "07", title: "Delivery Support", text: "Careful, on-time delivery across Bengaluru, handled by our own crew." },
  { num: "08", title: "Installation Support", text: "Every piece assembled, levelled and styled in your home by experts." },
];

// SAMPLE testimonials (verified: false) — replace with real customer reviews later.
// The verified badge in the UI renders ONLY when a review has verified: true.
export const TESTIMONIALS = [
  { name: "Ramesh Kulkarni", area: "TC Palya", rating: 5, purchase: "Dining Table", color: "bg-espresso", text: "Good collection and the quality of the wood is really nice. Staff were helpful and explained all the options properly.", verified: false },
  { name: "Shabana Begum", area: "KR Puram", rating: 5, purchase: "Sofa Set & Dining Table", color: "bg-copper", text: "We purchased a sofa set and dining table from here. Quality is good and the delivery was handled nicely.", verified: false },
  { name: "Venkatesh Gowda", area: "Ramamurthy Nagar", rating: 4, purchase: "Queen Size Bed", color: "bg-olive", text: "Had a good experience. We were looking for a bed in a specific size and they helped us choose the right one.", verified: false },
  { name: "Divya Ramesh", area: "Hoodi", rating: 5, purchase: "Coffee Table", color: "bg-royal", text: "Nice collection and reasonable pricing. The staff were also very friendly.", verified: false },
  { name: "Imran Pasha", area: "Kalkere", rating: 5, purchase: "TV Unit", color: "bg-copper", text: "Bought a TV unit last month. Finishing is neat and they installed it the same evening itself. Happy with the purchase.", verified: false },
  { name: "Suma Prakash", area: "Seegehalli", rating: 4, purchase: "Wardrobe", color: "bg-espresso", text: "This is our second purchase here. First a shoe rack, now a wardrobe. No complaints. Rate is also reasonable compared to big showrooms.", verified: false },
];

export const STATS = [
  { value: 10, suffix: "+", label: "Years of Experience" },
  { value: 5000, suffix: "+", label: "Happy Customers" },
  { value: 3000, suffix: "+", label: "Furniture Delivered" },
  { value: 100, suffix: "+", label: "Custom Projects" },
];

export const MARQUEE_ITEMS = [
  "Luxury Sofas", "Solid Wood Beds", "Dining Tables", "TV Units", "Wardrobes",
  "Coffee Tables", "Custom Furniture", "Shoe Racks", "Office Furniture", "LCD Stands",
];
