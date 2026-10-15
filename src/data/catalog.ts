import heroIndoor from "@/assets/hero-1.jpg";
import heroWholesale from "@/assets/hero-2.jpg";
import heroBalcony from "@/assets/hero-3.jpg";
import heroSeasonal from "@/assets/hero-4.jpg";
import bannerSeasonal from "@/assets/banner-seasonal.jpg";
import corporateImg from "@/assets/corporate.jpg";
import aboutImg from "@/assets/about-nursery.jpg";
import pIndoor from "@/assets/p-indoor.jpg";
import pFlowering from "@/assets/p-flowering.jpg";
import pSeeds from "@/assets/p-seeds.jpg";
import pPots from "@/assets/p-pots.jpg";
import pTools from "@/assets/p-tools.jpg";
import pFertilizer from "@/assets/p-fertilizer.jpg";
import pKit from "@/assets/p-kit.jpg";
import pSnake from "@/assets/p-snake.jpg";

export const images = {
  heroIndoor,
  heroWholesale,
  heroBalcony,
  heroSeasonal,
  bannerSeasonal,
  corporateImg,
  aboutImg,
  pIndoor,
  pFlowering,
  pSeeds,
  pPots,
  pTools,
  pFertilizer,
  pKit,
  pSnake,
};

export const contact = {
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  whatsapp: "+91 98765 43210",
  whatsappHref: "https://wa.me/919876543210",
  email: "hello@verdantroots.in",
  wholesaleEmail: "b2b@verdantroots.in",
  address: "Survey No. 42, Green Belt Road, Talegaon, Pune, Maharashtra 410507",
  hours: "Mon – Sat: 8:00 AM – 7:00 PM | Sun: 9:00 AM – 2:00 PM",
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  groups: string[];
  price: number;
  mrp: number;
  wholesalePrice: number;
  moq: number;
  rating: number;
  reviews: number;
  image: string;
  hoverImage: string;
  inStock: boolean;
  isNew?: boolean | undefined;
  wholesale?: boolean | undefined;
  botanical: string;
  sunlight: "Bright Indirect" | "Full Sun" | "Partial Shade" | "Low Light";
  water: "Low" | "Medium" | "High";
  size: "Small" | "Medium" | "Large";
  potSize: string;
  placement: "Indoor" | "Outdoor";
  petSafe: boolean;
  difficulty: "Easy" | "Moderate";
  description: string;
  care: string[];
};

type Seed = Partial<Product> & { name: string; category: string; price: number; mrp: number; image: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const catSlug: Record<string, string> = {
  "Indoor Plants": "indoor-plants",
  "Outdoor Plants": "outdoor-plants",
  "Flowering Plants": "flowering-plants",
  Seeds: "seeds",
  "Pots & Planters": "pots-planters",
  "Gardening Tools": "gardening-tools",
  "Fertilizers & Manures": "fertilizers-manures",
  "Gardening Kits": "gardening-kits",
};

function make(seed: Seed, i: number): Product {
  const name = seed.name;
  const category = seed.category;
  return {
    id: `VR-${1000 + i}`,
    slug: slugify(name),
    name,
    category,
    categorySlug: catSlug[category] ?? slugify(category),
    groups: seed.groups ?? [],
    price: seed.price,
    mrp: seed.mrp,
    wholesalePrice: seed.wholesalePrice ?? Math.round(seed.price * 0.62),
    moq: seed.moq ?? 25,
    rating: seed.rating ?? 4.5,
    reviews: seed.reviews ?? 60 + ((i * 17) % 240),
    image: seed.image,
    hoverImage: seed.hoverImage ?? seed.image,
    inStock: seed.inStock ?? true,
    isNew: seed.isNew ?? false,
    wholesale: seed.wholesale ?? true,
    botanical: seed.botanical ?? "Plantae sp.",
    sunlight: seed.sunlight ?? "Bright Indirect",
    water: seed.water ?? "Medium",
    size: seed.size ?? "Medium",
    potSize: seed.potSize ?? '6 inch',
    placement: seed.placement ?? "Indoor",
    petSafe: seed.petSafe ?? true,
    difficulty: seed.difficulty ?? "Easy",
    description:
      seed.description ??
      `${name} is nursery-grown at our Pune farm, hardened for Indian weather and dispatched in protective packaging so it reaches you healthy and ready to grow.`,
    care: seed.care ?? [
      "Water when the top 2 inches of soil feel dry.",
      "Keep away from harsh afternoon sun for the first two weeks.",
      "Feed with organic vermicompost once every 30 days.",
      "Wipe leaves gently once a fortnight to keep pores clean.",
    ],
  };
}

const seeds: Seed[] = [
  { name: "Money Plant Golden", category: "Indoor Plants", price: 249, mrp: 399, image: pIndoor, hoverImage: pSnake, groups: ["bestsellers", "air-purifying", "low-maintenance", "office", "low-light"], botanical: "Epipremnum aureum", rating: 4.8, sunlight: "Low Light", water: "Low", difficulty: "Easy" },
  { name: "Snake Plant", category: "Indoor Plants", price: 349, mrp: 549, image: pSnake, hoverImage: pIndoor, groups: ["bestsellers", "air-purifying", "low-maintenance", "vastu", "office"], botanical: "Dracaena trifasciata", rating: 4.9, sunlight: "Low Light", water: "Low" },
  { name: "Peace Lily", category: "Indoor Plants", price: 449, mrp: 699, image: pIndoor, hoverImage: pFlowering, groups: ["bestsellers", "air-purifying", "new", "indoor"], botanical: "Spathiphyllum wallisii", rating: 4.7, petSafe: false },
  { name: "Areca Palm", category: "Indoor Plants", price: 599, mrp: 899, image: pIndoor, hoverImage: pSnake, groups: ["bestsellers", "air-purifying", "office", "indoor"], botanical: "Dypsis lutescens", size: "Large", potSize: "8 inch", rating: 4.6 },
  { name: "Jade Plant", category: "Indoor Plants", price: 299, mrp: 449, image: pSnake, hoverImage: pIndoor, groups: ["vastu", "low-maintenance", "indoor"], botanical: "Crassula ovata", water: "Low" },
  { name: "ZZ Plant", category: "Indoor Plants", price: 529, mrp: 799, image: pIndoor, hoverImage: pSnake, groups: ["new", "low-maintenance", "low-light", "office"], botanical: "Zamioculcas zamiifolia", sunlight: "Low Light" },
  { name: "Tulsi Plant", category: "Outdoor Plants", price: 179, mrp: 249, image: pFlowering, hoverImage: pIndoor, groups: ["vastu", "medicinal", "bestsellers", "balcony"], botanical: "Ocimum tenuiflorum", placement: "Outdoor", sunlight: "Full Sun" },
  { name: "Rose Plant Desi Red", category: "Flowering Plants", price: 329, mrp: 499, image: pFlowering, hoverImage: pIndoor, groups: ["flowering", "balcony", "full-sun", "bestsellers"], botanical: "Rosa indica", placement: "Outdoor", sunlight: "Full Sun", water: "High" },
  { name: "Aloe Vera", category: "Outdoor Plants", price: 199, mrp: 299, image: pSnake, hoverImage: pIndoor, groups: ["medicinal", "low-maintenance", "balcony"], botanical: "Aloe barbadensis", sunlight: "Partial Shade", water: "Low" },
  { name: "Hibiscus Plant", category: "Flowering Plants", price: 379, mrp: 549, image: pFlowering, hoverImage: pSeeds, groups: ["flowering", "full-sun", "outdoor"], botanical: "Hibiscus rosa-sinensis", placement: "Outdoor", sunlight: "Full Sun" },
  { name: "Bougainvillea Pink", category: "Flowering Plants", price: 449, mrp: 649, image: pFlowering, hoverImage: pIndoor, groups: ["flowering", "full-sun", "outdoor", "new"], botanical: "Bougainvillea glabra", placement: "Outdoor", sunlight: "Full Sun", size: "Large" },
  { name: "Jasmine Mogra", category: "Flowering Plants", price: 299, mrp: 429, image: pFlowering, hoverImage: pSnake, groups: ["flowering", "balcony", "vastu"], botanical: "Jasminum sambac", placement: "Outdoor", sunlight: "Full Sun" },
  { name: "Ficus Bonsai", category: "Indoor Plants", price: 1499, mrp: 2199, image: pIndoor, hoverImage: pPots, groups: ["bonsai", "premium", "indoor", "new"], botanical: "Ficus microcarpa", size: "Large", difficulty: "Moderate", rating: 4.4 },
  { name: "Lemon Fruit Plant", category: "Outdoor Plants", price: 549, mrp: 799, image: pFlowering, hoverImage: pSeeds, groups: ["fruit", "outdoor", "full-sun"], botanical: "Citrus limon", placement: "Outdoor", sunlight: "Full Sun", size: "Large" },
  { name: "Marigold Seeds", category: "Seeds", price: 79, mrp: 129, image: pSeeds, hoverImage: pFlowering, groups: ["seeds", "flower-seeds", "seasonal", "bestsellers"], botanical: "Tagetes erecta", placement: "Outdoor", sunlight: "Full Sun", moq: 100, wholesalePrice: 42 },
  { name: "Tomato Seeds Hybrid", category: "Seeds", price: 99, mrp: 149, image: pSeeds, hoverImage: pKit, groups: ["seeds", "vegetable-seeds", "seasonal"], botanical: "Solanum lycopersicum", placement: "Outdoor", sunlight: "Full Sun", moq: 100, wholesalePrice: 55 },
  { name: "Coriander Seeds", category: "Seeds", price: 59, mrp: 99, image: pSeeds, hoverImage: pKit, groups: ["seeds", "herb-seeds", "seasonal", "bestsellers"], botanical: "Coriandrum sativum", placement: "Outdoor", moq: 100, wholesalePrice: 32 },
  { name: "Microgreen Starter Seeds", category: "Seeds", price: 149, mrp: 229, image: pSeeds, hoverImage: pKit, groups: ["seeds", "microgreen", "new"], botanical: "Mixed micro varieties", moq: 50 },
  { name: "Sunflower Seeds", category: "Seeds", price: 89, mrp: 139, image: pSeeds, hoverImage: pFlowering, groups: ["seeds", "flower-seeds", "seasonal"], botanical: "Helianthus annuus", placement: "Outdoor", sunlight: "Full Sun", moq: 100 },
  { name: "Organic Vermicompost 5kg", category: "Fertilizers & Manures", price: 299, mrp: 449, image: pFertilizer, hoverImage: pKit, groups: ["essentials", "bestsellers", "manure"], botanical: "Organic input", moq: 20 },
  { name: "Cocopeat Block 5kg", category: "Fertilizers & Manures", price: 249, mrp: 379, image: pFertilizer, hoverImage: pKit, groups: ["essentials", "manure"], botanical: "Coir pith", moq: 20 },
  { name: "Neem Cake Powder 2kg", category: "Fertilizers & Manures", price: 219, mrp: 329, image: pFertilizer, hoverImage: pSeeds, groups: ["essentials", "manure", "new"], botanical: "Azadirachta indica cake", moq: 20 },
  { name: "Ceramic Planter Ivory", category: "Pots & Planters", price: 699, mrp: 1099, image: pPots, hoverImage: pIndoor, groups: ["essentials", "premium"], botanical: "Glazed ceramic", moq: 12, petSafe: true },
  { name: "Terracotta Pot Set of 4", category: "Pots & Planters", price: 549, mrp: 849, image: pPots, hoverImage: pFlowering, groups: ["essentials", "bestsellers"], botanical: "Fired terracotta", moq: 12 },
  { name: "Self Watering Planter", category: "Pots & Planters", price: 899, mrp: 1299, image: pPots, hoverImage: pSnake, groups: ["essentials", "new", "premium"], botanical: "Recycled polymer", moq: 12, inStock: false },
  { name: "Gardening Tool Kit 5 Piece", category: "Gardening Tools", price: 799, mrp: 1199, image: pTools, hoverImage: pKit, groups: ["essentials", "bestsellers"], botanical: "Carbon steel & beech wood", moq: 10 },
  { name: "Pruning Secateur Pro", category: "Gardening Tools", price: 499, mrp: 749, image: pTools, hoverImage: pKit, groups: ["essentials"], botanical: "Stainless steel", moq: 10 },
  { name: "Watering Can 5L", category: "Gardening Tools", price: 399, mrp: 599, image: pTools, hoverImage: pPots, groups: ["essentials", "new"], botanical: "Powder coated metal", moq: 10 },
  { name: "Kitchen Garden Grow Kit", category: "Gardening Kits", price: 999, mrp: 1499, image: pKit, hoverImage: pSeeds, groups: ["kits", "bestsellers", "new"], botanical: "Complete grow set", moq: 10 },
  { name: "Balcony Herb Kit", category: "Gardening Kits", price: 849, mrp: 1249, image: pKit, hoverImage: pSeeds, groups: ["kits", "balcony"], botanical: "Herb starter set", moq: 10 },
  { name: "Microgreens Grow Kit", category: "Gardening Kits", price: 749, mrp: 1099, image: pKit, hoverImage: pSeeds, groups: ["kits", "new"], botanical: "Micro grow set", moq: 10 },
  { name: "Bulk Landscaping Sapling Pack", category: "Outdoor Plants", price: 4999, mrp: 6999, image: pFlowering, hoverImage: pIndoor, groups: ["wholesale", "landscaping"], botanical: "Mixed avenue saplings", placement: "Outdoor", sunlight: "Full Sun", moq: 5, wholesalePrice: 3499, size: "Large" },
];

export const products: Product[] = seeds.map(make);

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const byGroup = (g: string, n = 8) => products.filter((p) => p.groups.includes(g)).slice(0, n);
export const byCategory = (slug: string, n = 12) => products.filter((p) => p.categorySlug === slug).slice(0, n);

export type CategoryDef = {
  slug: string;
  title: string;
  blurb: string;
  match: (p: Product) => boolean;
};

export const categoryPages: CategoryDef[] = [
  { slug: "all", title: "All Products", blurb: "Every plant, seed and gardening essential from our nursery.", match: () => true },
  { slug: "plants", title: "Plants", blurb: "Nursery-grown, hardened and quality checked before dispatch.", match: (p) => ["indoor-plants", "outdoor-plants", "flowering-plants"].includes(p.categorySlug) },
  { slug: "indoor-plants", title: "Indoor Plants", blurb: "Air-purifying greens that thrive inside Indian homes and offices.", match: (p) => p.categorySlug === "indoor-plants" },
  { slug: "outdoor-plants", title: "Outdoor Plants", blurb: "Sun-loving plants for terraces, balconies and gardens.", match: (p) => p.categorySlug === "outdoor-plants" },
  { slug: "flowering-plants", title: "Flowering Plants", blurb: "Season-long blooms in classic Indian garden favourites.", match: (p) => p.categorySlug === "flowering-plants" },
  { slug: "seeds", title: "Seeds", blurb: "High germination flower, vegetable, herb and microgreen seeds.", match: (p) => p.categorySlug === "seeds" },
  { slug: "flower-seeds", title: "Flower Seeds", blurb: "Bright, easy-to-grow blooms for every season.", match: (p) => p.groups.includes("flower-seeds") },
  { slug: "vegetable-seeds", title: "Vegetable Seeds", blurb: "Grow your own kitchen garden harvest.", match: (p) => p.groups.includes("vegetable-seeds") },
  { slug: "herb-seeds", title: "Herb Seeds", blurb: "Fresh herbs for your windowsill and balcony.", match: (p) => p.groups.includes("herb-seeds") },
  { slug: "pots-planters", title: "Pots & Planters", blurb: "Terracotta, ceramic and self-watering planters.", match: (p) => p.categorySlug === "pots-planters" },
  { slug: "gardening-tools", title: "Gardening Tools", blurb: "Durable tools built for everyday gardening.", match: (p) => p.categorySlug === "gardening-tools" },
  { slug: "fertilizers-manures", title: "Fertilizers & Manures", blurb: "Organic manures, cocopeat and soil conditioners.", match: (p) => p.categorySlug === "fertilizers-manures" },
  { slug: "gardening-kits", title: "Gardening Kits", blurb: "Ready-to-grow kits with everything in one box.", match: (p) => p.categorySlug === "gardening-kits" },
  { slug: "sustainable-living", title: "Sustainable Living", blurb: "Compost, coir and low-waste gardening essentials.", match: (p) => p.groups.includes("manure") || p.groups.includes("kits") },
  { slug: "wholesale-products", title: "Wholesale Products", blurb: "Bulk pricing for nurseries, landscapers and businesses.", match: (p) => p.wholesale === true },
  { slug: "offers", title: "Offers", blurb: "Limited period nursery deals across every category.", match: (p) => (p.mrp - p.price) / p.mrp >= 0.3 },
  { slug: "new-arrivals", title: "New Arrivals", blurb: "Freshly added to the nursery this season.", match: (p) => Boolean(p.isNew) || p.groups.includes("new") },
  { slug: "bestsellers", title: "Bestsellers", blurb: "Most loved by our retail and wholesale customers.", match: (p) => p.groups.includes("bestsellers") },
  { slug: "air-purifying", title: "Air Purifying Plants", blurb: "Greens that quietly clean the air around you.", match: (p) => p.groups.includes("air-purifying") },
  { slug: "low-maintenance", title: "Low Maintenance Plants", blurb: "Forgiving plants for busy people.", match: (p) => p.groups.includes("low-maintenance") },
  { slug: "pet-friendly", title: "Pet Friendly Plants", blurb: "Safe around cats, dogs and curious toddlers.", match: (p) => p.petSafe },
  { slug: "vastu-plants", title: "Vastu Plants", blurb: "Traditional plants believed to bring positivity home.", match: (p) => p.groups.includes("vastu") },
  { slug: "office-plants", title: "Office Plants", blurb: "Desk and lobby greens for workspaces.", match: (p) => p.groups.includes("office") },
  { slug: "balcony-plants", title: "Balcony Plants", blurb: "Compact plants that love a sunny balcony.", match: (p) => p.groups.includes("balcony") },
  { slug: "full-sun-plants", title: "Full Sun Plants", blurb: "Built for bright, direct Indian sunlight.", match: (p) => p.sunlight === "Full Sun" },
  { slug: "low-light-plants", title: "Low Light Plants", blurb: "Happy in shaded corners and north-facing rooms.", match: (p) => p.sunlight === "Low Light" },
  { slug: "medicinal-plants", title: "Medicinal Plants", blurb: "Ayurvedic and home-remedy favourites.", match: (p) => p.groups.includes("medicinal") },
  { slug: "succulents-cactus", title: "Succulents & Cactus", blurb: "Water-wise plants with sculptural character.", match: (p) => p.water === "Low" },
  { slug: "fruit-plants", title: "Fruit Plants", blurb: "Home-grown fruit for terrace gardens.", match: (p) => p.groups.includes("fruit") },
  { slug: "bonsai-plants", title: "Bonsai Plants", blurb: "Hand-trained miniature trees.", match: (p) => p.groups.includes("bonsai") },
  { slug: "microgreen-seeds", title: "Microgreen Seeds", blurb: "Fast, nutrient-dense greens in 10 days.", match: (p) => p.groups.includes("microgreen") },
  { slug: "seasonal-seeds", title: "Seasonal Seeds", blurb: "Sowing-ready varieties for the current season.", match: (p) => p.groups.includes("seasonal") },
  { slug: "fruit-seeds", title: "Fruit Seeds", blurb: "Start fruit plants from seed at home.", match: (p) => p.groups.includes("seeds") },
  { slug: "organic-manures", title: "Organic Manures", blurb: "Chemical-free nutrition for healthy soil.", match: (p) => p.groups.includes("manure") },
  { slug: "cocopeat-soil", title: "Cocopeat & Soil", blurb: "Potting mixes and coir blocks.", match: (p) => p.groups.includes("manure") },
  { slug: "plant-care", title: "Plant Care Products", blurb: "Everything to keep your plants thriving.", match: (p) => p.groups.includes("essentials") },
];

export const getCategory = (slug: string) => categoryPages.find((c) => c.slug === slug);

export const homeCategories = [
  { title: "Plants", slug: "plants", image: pIndoor },
  { title: "Indoor Plants", slug: "indoor-plants", image: pSnake },
  { title: "Flower Seeds", slug: "flower-seeds", image: pSeeds },
  { title: "Vegetable Seeds", slug: "vegetable-seeds", image: pSeeds },
  { title: "Gardening Tools", slug: "gardening-tools", image: pTools },
  { title: "Sustainable Living", slug: "sustainable-living", image: pFertilizer },
  { title: "Gardening Kits", slug: "gardening-kits", image: pKit },
  { title: "Herb Seeds", slug: "herb-seeds", image: pSeeds },
  { title: "Manures", slug: "organic-manures", image: pFertilizer },
  { title: "Pots & Planters", slug: "pots-planters", image: pPots },
];

export const megaMenus = {
  plants: {
    label: "Plants",
    items: [
      "Indoor Plants|indoor-plants",
      "Outdoor Plants|outdoor-plants",
      "Flowering Plants|flowering-plants",
      "Air Purifying Plants|air-purifying",
      "Low Maintenance Plants|low-maintenance",
      "Vastu Plants|vastu-plants",
      "Medicinal Plants|medicinal-plants",
      "Succulents and Cactus|succulents-cactus",
      "Fruit Plants|fruit-plants",
      "Bonsai Plants|bonsai-plants",
    ],
  },
  seeds: {
    label: "Seeds",
    items: [
      "Flower Seeds|flower-seeds",
      "Fruit Seeds|fruit-seeds",
      "Herb Seeds|herb-seeds",
      "Seasonal Seeds|seasonal-seeds",
    ],
  },
  gardening: {
    label: "Gardening",
    items: [
      "Pots and Planters|pots-planters",
      "Gardening Tools|gardening-tools",
      "Fertilizers|fertilizers-manures",
      "Organic Manures|organic-manures",
      "Cocopeat and Soil|cocopeat-soil",
      "Gardening Kits|gardening-kits",
      "Plant Care Products|plant-care",
    ],
  },
};

export const blogs = [
  {
    slug: "best-indoor-plants-for-indian-homes",
    title: "Best Indoor Plants for Indian Homes",
    category: "Indoor Gardening",
    date: "12 July 2026",
    author: "Ananya Kulkarni",
    read: "6 min read",
    image: pIndoor,
    excerpt: "Ten hardy indoor plants that survive Indian summers, humidity and our famously unpredictable watering habits.",
    body: [
      "Indian homes get a very particular kind of light — bright but filtered, hot through the afternoon, and dusty for a good part of the year. The plants that thrive here are the ones that tolerate swings rather than demand perfection.",
      "Start with money plant, snake plant and ZZ plant. All three handle low light, irregular watering and travel well between rooms. If you have a bright window, add a peace lily for flowers and an areca palm for volume.",
      "Group plants together to raise local humidity, and rotate the pot a quarter turn every week so growth stays even. Wipe the leaves fortnightly — a dusty leaf is a leaf that cannot breathe.",
      "Finally, do not repot immediately after delivery. Give the plant two weeks to settle into its new light before you disturb the roots.",
    ],
  },
  {
    slug: "how-to-care-for-plants-during-summer",
    title: "How to Care for Plants During Summer",
    category: "Plant Care",
    date: "28 June 2026",
    author: "Rahul Deshpande",
    read: "5 min read",
    image: pFlowering,
    excerpt: "Watering timings, shade nets and mulch tricks that keep your garden alive through 42°C afternoons.",
    body: [
      "Water early morning or after sunset. Midday watering shocks warm roots and most of it evaporates before it is absorbed.",
      "Mulch every outdoor pot with dry leaves, cocopeat or coconut husk. A two-inch mulch layer can cut water loss by nearly half.",
      "Move tender indoor plants away from west-facing windows, and use a 50% shade net over terrace gardens between April and June.",
      "Skip fertiliser during peak heat. Feeding a heat-stressed plant pushes weak growth that burns within days.",
    ],
  },
  {
    slug: "beginners-guide-to-kitchen-gardening",
    title: "Beginner's Guide to Kitchen Gardening",
    category: "Kitchen Garden",
    date: "09 June 2026",
    author: "Meera Nair",
    read: "8 min read",
    image: pKit,
    excerpt: "From coriander in a tray to tomatoes in a grow bag — a simple first-season plan for Indian balconies.",
    body: [
      "Begin with three forgiving crops: coriander, methi and spinach. All three germinate within a week and forgive beginner mistakes.",
      "Use a potting mix of 40% garden soil, 40% cocopeat and 20% vermicompost. This drains well and still holds moisture through the day.",
      "Grow bags are cheaper and lighter than pots, and their fabric walls air-prune roots, which produces stronger plants.",
      "Harvest often. Regular clipping tells the plant to keep producing, and you get fresher greens than any market can offer.",
    ],
  },
  {
    slug: "how-to-choose-plants-for-your-balcony",
    title: "How to Choose Plants for Your Balcony",
    category: "Balcony Garden",
    date: "21 May 2026",
    author: "Ananya Kulkarni",
    read: "4 min read",
    image: pPots,
    excerpt: "Direction, wind and weight limits matter more than looks. Here is how to pick plants that actually survive.",
    body: [
      "First, note the direction. South and west balconies get harsh sun and suit bougainvillea, hibiscus and adenium. North and east balconies suit ferns, peace lilies and syngonium.",
      "Second, respect wind. High-floor balconies dry pots out quickly — choose thicker-leaved plants and heavier ceramic planters.",
      "Third, check load. Filled large pots can weigh 30 kg or more. Use lightweight potting mix and railing planters where weight is a concern.",
      "Finally, plan for maintenance while you travel. Self-watering planters and a neighbour with a key are both excellent inventions.",
    ],
  },
];

export const testimonials = [
  { name: "Priya Sharma", city: "Bengaluru", rating: 5, text: "Every plant arrived healthy and well packed. The peace lily flowered within three weeks of delivery." },
  { name: "Arun Menon", city: "Kochi", rating: 5, text: "We source landscaping saplings in bulk. Pricing is transparent and the delivery coordination has been excellent." },
  { name: "Ritika Jain", city: "Jaipur", rating: 4, text: "Loved the balcony herb kit. The care card was genuinely useful for a first-time gardener like me." },
  { name: "Sandeep Rao", city: "Hyderabad", rating: 5, text: "Ordered 200 office plants for our new floor. Verified, uniform quality and invoiced properly for GST." },
  { name: "Neha Bhatt", city: "Ahmedabad", rating: 5, text: "The snake plants are lush and the pots are far better quality than what I got locally." },
];

export const services = [
  { slug: "retail-plant-sales", title: "Retail Plant Sales", icon: "Sprout", short: "Healthy plants delivered to your doorstep across India.", detail: "Browse over a thousand nursery-grown plants, seeds and gardening essentials. Every retail order is quality checked, root-inspected and packed in shock-proof cartons before dispatch." },
  { slug: "wholesale-plant-supply", title: "Wholesale Plant Supply", icon: "Truck", short: "Bulk plants at business pricing with dedicated support.", detail: "Approved B2B buyers unlock slab-based wholesale pricing, priority dispatch, GST invoicing and a dedicated account manager for recurring orders." },
  { slug: "landscaping-plants", title: "Landscaping Plants", icon: "Trees", short: "Avenue trees, hedges and ground cover in volume.", detail: "We supply avenue plants, hedging, shrubs and ground cover for townships, highways and campus projects, with phased delivery aligned to your site schedule." },
  { slug: "corporate-plant-gifting", title: "Corporate Plant Gifting", icon: "Gift", short: "Branded plant gifts for clients and employees.", detail: "Custom ceramic planters, branded sleeves and care cards, packed and shipped to multiple addresses across India from a single order." },
  { slug: "office-plant-setup", title: "Office Plant Setup", icon: "Building2", short: "Complete green setup for workspaces.", detail: "Site survey, plant selection by light zone, planter styling, installation and an optional monthly maintenance visit by our horticulture team." },
  { slug: "garden-consultation", title: "Garden Consultation", icon: "ClipboardList", short: "Expert planning for balconies, terraces and gardens.", detail: "A horticulturist reviews your space, sunlight and budget, then shares a planting plan with a species list, pot sizes and a seasonal care calendar." },
  { slug: "plant-maintenance", title: "Plant Maintenance", icon: "Scissors", short: "Scheduled care so your green stays green.", detail: "Fortnightly or monthly visits covering pruning, feeding, pest management, repotting and replacement of any plant that does not thrive." },
  { slug: "bulk-seed-supply", title: "Bulk Seed Supply", icon: "Wheat", short: "High germination seeds in commercial quantities.", detail: "Flower, vegetable, herb and microgreen seeds supplied in bulk packs with germination reports and lot traceability." },
  { slug: "custom-gardening-kits", title: "Custom Gardening Kits", icon: "Package", short: "Kits designed for your brand or programme.", detail: "Build your own kit — seeds, soil, planter and tools — with custom packaging for schools, CSR programmes and retail private labels." },
];

export const faqs = [
  { q: "What is the minimum order quantity for wholesale?", a: "Wholesale orders start at ₹15,000 per invoice, with a per-product minimum shown on each wholesale listing (typically 10 to 100 units)." },
  { q: "How long does account approval take?", a: "Most B2B accounts are verified within 24 to 48 working hours after we receive your GST and business documents." },
  { q: "Do you deliver across India?", a: "Yes. We ship to over 20,000 pin codes. Plants travel in ventilated, shock-proof packaging and usually reach within 3 to 7 days." },
  { q: "What if a plant arrives damaged?", a: "Share an unboxing photo within 48 hours and we will replace the plant or refund it — no questions asked." },
  { q: "Can I get a GST invoice?", a: "Every retail and wholesale order can be invoiced with your GSTIN. Add it at checkout or in your B2B profile." },
  { q: "Do wholesale prices change with quantity?", a: "Yes. Slab pricing improves at 100, 500 and 1,000 units. Your account manager can share the full rate card." },
  { q: "Do you offer recurring supply contracts?", a: "We do. Monthly and quarterly supply schedules are available for nurseries, landscapers and facility management companies." },
  { q: "Which payment methods are accepted?", a: "UPI, credit and debit cards, net banking and cash on delivery for retail. Approved B2B accounts can request credit terms." },
];

export const trustFeatures = [
  { icon: "ShieldCheck", title: "Quality Checked Plants", text: "Root and leaf inspected before every dispatch" },
  { icon: "Package", title: "Safe Plant Packaging", text: "Ventilated, shock-proof nursery cartons" },
  { icon: "Truck", title: "Pan-India Delivery", text: "20,000+ pin codes served" },
  { icon: "Lock", title: "Secure Payments", text: "UPI, cards, net banking and COD" },
  { icon: "Leaf", title: "Gardening Guidance", text: "Free care cards and expert support" },
  { icon: "Store", title: "Retail & Wholesale", text: "One nursery, two ways to buy" },
];

export const requirementShortcuts = [
  { title: "Low Maintenance", slug: "low-maintenance", icon: "Sprout" },
  { title: "Air Purifying", slug: "air-purifying", icon: "Wind" },
  { title: "Pet Friendly", slug: "pet-friendly", icon: "PawPrint" },
  { title: "Vastu Friendly", slug: "vastu-plants", icon: "Compass" },
  { title: "Office Plants", slug: "office-plants", icon: "Building2" },
  { title: "Balcony Plants", slug: "balcony-plants", icon: "Home" },
  { title: "Full Sun Plants", slug: "full-sun-plants", icon: "Sun" },
  { title: "Low Light Plants", slug: "low-light-plants", icon: "Moon" },
];

export const heroSlides = [
  {
    image: heroIndoor,
    heading: "Bring Nature Closer to Your Home",
    sub: "Healthy plants, premium seeds and complete gardening essentials.",
    primary: { label: "Shop Plants", to: "/category/plants" },
    secondary: { label: "Explore Categories", to: "/category/all" },
  },
  {
    image: heroWholesale,
    heading: "Wholesale Plants at Business Prices",
    sub: "Bulk plants and nursery supplies for dealers, landscapers and businesses.",
    primary: { label: "Register for B2B", to: "/wholesale/register" },
    secondary: { label: "View Wholesale Products", to: "/category/wholesale-products" },
  },
  {
    image: heroBalcony,
    heading: "Grow Your Dream Garden",
    sub: "Discover quality plants, seeds, pots and gardening kits.",
    primary: { label: "Shop Now", to: "/category/all" },
    secondary: { label: "View Bestsellers", to: "/category/bestsellers" },
  },
  {
    image: heroSeasonal,
    heading: "Seasonal Plants & Exclusive Offers",
    sub: "Explore new arrivals and special nursery collections.",
    primary: { label: "View Offers", to: "/category/offers" },
    secondary: { label: "Shop New Arrivals", to: "/category/new-arrivals" },
  },
];

export const brand = {
  name: "Aaradhya rose nursary",
  tagline: "From Our Nursery to Your Garden",
};
