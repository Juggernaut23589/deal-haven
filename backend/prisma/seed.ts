import { PrismaClient, UserRole, ListingStatus, ListingCondition, ListingType, OrderStatus, OfferStatus, EscrowStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Deal Haven database...');

  // ─── Clean slate ───
  await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;

  // ─── Categories ───
  console.log('Creating categories...');

  const categoriesData = [
    {
      name: 'Automobiles', slug: 'automobiles', sortOrder: 1, isFeatured: true,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f697.svg',
      children: [
        { name: 'Cars & Trucks', slug: 'cars-trucks' },
        { name: 'Motorcycles', slug: 'motorcycles' },
        { name: 'RVs & Campers', slug: 'rvs-campers' },
        { name: 'Boats', slug: 'boats' },
        { name: 'Parts & Accessories', slug: 'auto-parts' },
        { name: 'Commercial Vehicles', slug: 'commercial-vehicles' },
      ],
    },
    {
      name: 'Real Estate', slug: 'real-estate', sortOrder: 2, isFeatured: true,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f3e0.svg',
      children: [
        { name: 'Houses for Sale', slug: 'houses-for-sale' },
        { name: 'Apartments & Condos', slug: 'apartments-condos' },
        { name: 'Land', slug: 'land' },
        { name: 'Commercial Property', slug: 'commercial-property' },
        { name: 'Rentals', slug: 'rentals' },
      ],
    },
    {
      name: 'Electronics', slug: 'electronics', sortOrder: 3, isFeatured: true,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4bb.svg',
      children: [
        { name: 'Phones & Tablets', slug: 'phones-tablets' },
        { name: 'Computers & Laptops', slug: 'computers-laptops' },
        { name: 'TVs & Monitors', slug: 'tvs-monitors' },
        { name: 'Gaming', slug: 'gaming' },
        { name: 'Audio', slug: 'audio' },
        { name: 'Cameras', slug: 'cameras' },
        { name: 'Wearables', slug: 'wearables' },
      ],
    },
    {
      name: 'Clothing & Accessories', slug: 'clothing-accessories', sortOrder: 4, isFeatured: true,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f455.svg',
      children: [
        { name: "Men's Clothing", slug: 'mens-clothing' },
        { name: "Women's Clothing", slug: 'womens-clothing' },
        { name: 'Shoes', slug: 'shoes' },
        { name: 'Bags & Purses', slug: 'bags-purses' },
        { name: 'Jewelry & Watches', slug: 'jewelry-watches' },
        { name: 'Accessories', slug: 'accessories' },
      ],
    },
    {
      name: 'Furniture & Home', slug: 'furniture-home', sortOrder: 5, isFeatured: false,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f6cb.svg',
      children: [
        { name: 'Living Room', slug: 'living-room' },
        { name: 'Bedroom', slug: 'bedroom' },
        { name: 'Kitchen & Dining', slug: 'kitchen-dining' },
        { name: 'Office Furniture', slug: 'office-furniture' },
        { name: 'Outdoor & Patio', slug: 'outdoor-patio' },
        { name: 'Home Decor', slug: 'home-decor' },
        { name: 'Appliances', slug: 'appliances' },
      ],
    },
    {
      name: 'Services', slug: 'services', sortOrder: 6, isFeatured: true,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f527.svg',
      children: [
        { name: 'Home Services', slug: 'home-services' },
        { name: 'Professional Services', slug: 'professional-services' },
        { name: 'Tech Services', slug: 'tech-services' },
        { name: 'Personal Services', slug: 'personal-services' },
        { name: 'Events', slug: 'events-services' },
        { name: 'Automotive Services', slug: 'automotive-services' },
      ],
    },
    {
      name: 'Jobs & Gigs', slug: 'jobs-gigs', sortOrder: 7, isFeatured: false,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4bc.svg',
      children: [
        { name: 'Full-time', slug: 'full-time-jobs' },
        { name: 'Part-time', slug: 'part-time-jobs' },
        { name: 'Freelance', slug: 'freelance' },
        { name: 'Internships', slug: 'internships' },
        { name: 'Temporary', slug: 'temporary-jobs' },
      ],
    },
    {
      name: 'Sports & Outdoors', slug: 'sports-outdoors', sortOrder: 8, isFeatured: false,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/26bd.svg',
      children: [],
    },
    {
      name: 'Books & Media', slug: 'books-media', sortOrder: 9, isFeatured: false,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4da.svg',
      children: [],
    },
    {
      name: 'Collectibles & Art', slug: 'collectibles-art', sortOrder: 10, isFeatured: false,
      iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f3a8.svg',
      children: [],
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const { children, ...catData } = cat;
    const parent = await prisma.category.create({
      data: { ...catData, isActive: true },
    });
    categoryMap[parent.slug] = parent.id;

    for (const child of children) {
      const childCat = await prisma.category.create({
        data: { ...child, parentId: parent.id, isActive: true, sortOrder: 0 },
      });
      categoryMap[childCat.slug] = childCat.id;
    }
  }

  // Category attributes for Automobiles
  const autoId = categoryMap['automobiles'];
  if (autoId) {
    await prisma.categoryAttribute.createMany({
      data: [
        { categoryId: autoId, name: 'Make', slug: 'make', attributeType: 'TEXT', isRequired: true, isFilterable: true, sortOrder: 1 },
        { categoryId: autoId, name: 'Model', slug: 'model', attributeType: 'TEXT', isRequired: true, isFilterable: true, sortOrder: 2 },
        { categoryId: autoId, name: 'Year', slug: 'year', attributeType: 'NUMBER', isRequired: true, isFilterable: true, sortOrder: 3 },
        { categoryId: autoId, name: 'Mileage', slug: 'mileage', attributeType: 'NUMBER', isRequired: true, isFilterable: true, sortOrder: 4, unit: 'miles' },
        { categoryId: autoId, name: 'Fuel Type', slug: 'fuel-type', attributeType: 'SELECT', isFilterable: true, sortOrder: 5, options: JSON.stringify(['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']) },
        { categoryId: autoId, name: 'Transmission', slug: 'transmission', attributeType: 'SELECT', isFilterable: true, sortOrder: 6, options: JSON.stringify(['Automatic', 'Manual', 'CVT', 'DCT']) },
        { categoryId: autoId, name: 'Color', slug: 'color', attributeType: 'TEXT', sortOrder: 7 },
        { categoryId: autoId, name: 'Body Type', slug: 'body-type', attributeType: 'SELECT', isFilterable: true, sortOrder: 8, options: JSON.stringify(['Sedan', 'SUV', 'Truck', 'Coupe', 'Van', 'Convertible', 'Wagon', 'Hatchback']) },
        { categoryId: autoId, name: 'VIN', slug: 'vin', attributeType: 'TEXT', sortOrder: 9 },
      ],
    });
  }

  // Real estate attributes
  const reId = categoryMap['real-estate'];
  if (reId) {
    await prisma.categoryAttribute.createMany({
      data: [
        { categoryId: reId, name: 'Bedrooms', slug: 'bedrooms', attributeType: 'NUMBER', isRequired: true, isFilterable: true, sortOrder: 1 },
        { categoryId: reId, name: 'Bathrooms', slug: 'bathrooms', attributeType: 'NUMBER', isRequired: true, isFilterable: true, sortOrder: 2 },
        { categoryId: reId, name: 'Square Feet', slug: 'sqft', attributeType: 'NUMBER', isFilterable: true, sortOrder: 3, unit: 'sqft' },
        { categoryId: reId, name: 'Lot Size', slug: 'lot-size', attributeType: 'NUMBER', isFilterable: true, sortOrder: 4, unit: 'acres' },
        { categoryId: reId, name: 'Year Built', slug: 'year-built', attributeType: 'NUMBER', isFilterable: true, sortOrder: 5 },
        { categoryId: reId, name: 'Property Type', slug: 'property-type', attributeType: 'SELECT', isFilterable: true, sortOrder: 6, options: JSON.stringify(['Single Family', 'Multi Family', 'Condo', 'Townhouse', 'Land', 'Commercial']) },
        { categoryId: reId, name: 'HOA Fee', slug: 'hoa-fee', attributeType: 'NUMBER', sortOrder: 7, unit: '/month' },
        { categoryId: reId, name: 'Garage', slug: 'garage', attributeType: 'BOOLEAN', sortOrder: 8 },
      ],
    });
  }

  // Electronics attributes
  const elecId = categoryMap['electronics'];
  if (elecId) {
    await prisma.categoryAttribute.createMany({
      data: [
        { categoryId: elecId, name: 'Brand', slug: 'brand', attributeType: 'TEXT', isFilterable: true, sortOrder: 1 },
        { categoryId: elecId, name: 'Model', slug: 'model', attributeType: 'TEXT', sortOrder: 2 },
        { categoryId: elecId, name: 'Storage', slug: 'storage', attributeType: 'SELECT', isFilterable: true, sortOrder: 3, options: JSON.stringify(['32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB']) },
        { categoryId: elecId, name: 'Color', slug: 'color', attributeType: 'TEXT', sortOrder: 4 },
      ],
    });
  }

  // ─── Users ───
  console.log('Creating users...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dealhaven.com',
      passwordHash,
      username: 'admin',
      roles: [UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER],
      emailVerified: true,
      emailVerifiedAt: new Date(),
      profile: { create: { firstName: 'Admin', lastName: 'User', displayName: 'Admin' } },
    },
  });

  const sellers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'techseller@example.com',
        passwordHash,
        username: 'techseller',
        roles: [UserRole.SELLER, UserRole.BUYER],
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: { create: { firstName: 'Alex', lastName: 'Thompson', displayName: 'Alex Thompson', city: 'San Francisco', state: 'CA', country: 'US' } },
        sellerProfile: { create: { shopName: "Alex's Tech Store", shopSlug: 'alexs-tech-store', shopDescription: 'Premium electronics and gadgets at competitive prices. Fast shipping, authentic products.', verificationStatus: 'VERIFIED', isStarSeller: true, totalSales: 234, totalRevenue: 87650, averageRating: 4.9, totalReviews: 156, responseRate: 98.5, avgResponseTime: 12, payoutEnabled: true } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'carseller@example.com',
        passwordHash,
        username: 'carseller',
        roles: [UserRole.SELLER, UserRole.BUYER],
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: { create: { firstName: 'Marcus', lastName: 'Williams', displayName: 'Marcus Williams', city: 'Detroit', state: 'MI', country: 'US' } },
        sellerProfile: { create: { shopName: 'Marcus Auto Sales', shopSlug: 'marcus-auto-sales', shopDescription: 'Quality pre-owned vehicles. All cars inspected and certified. Financing available.', verificationStatus: 'VERIFIED', isStarSeller: true, totalSales: 89, totalRevenue: 2145000, averageRating: 4.8, totalReviews: 72, responseRate: 95.2, avgResponseTime: 45, payoutEnabled: true } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'fashionseller@example.com',
        passwordHash,
        username: 'fashionseller',
        roles: [UserRole.SELLER, UserRole.BUYER],
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: { create: { firstName: 'Sofia', lastName: 'Reyes', displayName: 'Sofia Reyes', city: 'New York', state: 'NY', country: 'US' } },
        sellerProfile: { create: { shopName: "Sofia's Boutique", shopSlug: 'sofias-boutique', shopDescription: 'Curated fashion finds, vintage pieces, and designer items. Sustainable shopping starts here.', verificationStatus: 'VERIFIED', isStarSeller: false, totalSales: 412, totalRevenue: 24800, averageRating: 4.7, totalReviews: 289, responseRate: 92.0, avgResponseTime: 28, payoutEnabled: true } },
      },
    }),
  ]);

  const buyers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'buyer1@example.com',
        passwordHash,
        username: 'buyer_john',
        roles: [UserRole.BUYER],
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: { create: { firstName: 'John', lastName: 'Doe', displayName: 'John Doe', city: 'Chicago', state: 'IL', country: 'US' } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'buyer2@example.com',
        passwordHash,
        username: 'buyer_jane',
        roles: [UserRole.BUYER],
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: { create: { firstName: 'Jane', lastName: 'Smith', displayName: 'Jane Smith', city: 'Austin', state: 'TX', country: 'US' } },
      },
    }),
  ]);

  // ─── Listings ───
  console.log('Creating listings...');

  const electronicsCategoryId = categoryMap['electronics'] ?? '';
  const autosCategoryId = categoryMap['automobiles'] ?? '';
  const clothingCategoryId = categoryMap['clothing-accessories'] ?? '';
  const realEstateCategoryId = categoryMap['real-estate'] ?? '';

  const baseListingData = (sellerId: string) => ({
    sellerId,
    status: ListingStatus.ACTIVE,
    publishedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Electronics listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        ...baseListingData(sellers[0].id),
        categoryId: electronicsCategoryId,
        title: 'Apple MacBook Pro 16" M3 Max — Space Black',
        slug: 'apple-macbook-pro-16-m3-max-space-black-abc123',
        description: 'Lightly used MacBook Pro 16-inch with the powerful M3 Max chip. Purchased 3 months ago, barely used, in pristine condition. Includes original box, charger, and all accessories. Battery cycles: 12.\n\n**Specs:**\n- M3 Max chip (16-core CPU, 40-core GPU)\n- 48GB Unified Memory\n- 1TB SSD\n- 16.2-inch Liquid Retina XDR display\n- Space Black finish',
        condition: ListingCondition.LIKE_NEW,
        listingType: ListingType.FIXED_AND_OFFER,
        price: 2899,
        originalPrice: 3999,
        offersEnabled: true,
        autoAcceptPrice: 2750,
        autoDeclinePrice: 2200,
        currency: 'USD',
        quantity: 1,
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        latitude: 37.7749,
        longitude: -122.4194,
        shipsNationally: true,
        viewCount: 847,
        favoriteCount: 43,
        watcherCount: 28,
        dealScore: 85,
        dealScoreLabel: 'Great Deal',
        marketAvgPrice: 3600,
        images: {
          create: [
            { url: 'https://picsum.photos/seed/mbp1/800/600', thumbnailUrl: 'https://picsum.photos/seed/mbp1/300/225', isCover: true, sortOrder: 0, altText: 'MacBook Pro front view' },
            { url: 'https://picsum.photos/seed/mbp2/800/600', thumbnailUrl: 'https://picsum.photos/seed/mbp2/300/225', isCover: false, sortOrder: 1, altText: 'MacBook Pro side view' },
            { url: 'https://picsum.photos/seed/mbp3/800/600', thumbnailUrl: 'https://picsum.photos/seed/mbp3/300/225', isCover: false, sortOrder: 2, altText: 'MacBook Pro ports' },
          ],
        },
        shippingOptions: {
          create: [
            { carrier: 'FEDEX', serviceName: 'FedEx 2-Day', price: 0, isFree: true, isDefault: true, estimatedDaysMin: 2, estimatedDaysMax: 3 },
          ],
        },
      },
    }),

    prisma.listing.create({
      data: {
        ...baseListingData(sellers[0].id),
        categoryId: electronicsCategoryId,
        title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
        slug: 'sony-wh1000xm5-wireless-headphones-def456',
        description: 'Sony WH-1000XM5 in excellent condition. Industry-leading noise cancellation, 30-hour battery life, multipoint connection. Used for 2 months, no scratches. Original packaging included.',
        condition: ListingCondition.LIKE_NEW,
        listingType: ListingType.FIXED_AND_OFFER,
        price: 249,
        originalPrice: 399,
        offersEnabled: true,
        autoAcceptPrice: 225,
        autoDeclinePrice: 180,
        currency: 'USD',
        quantity: 1,
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        shipsNationally: true,
        viewCount: 312,
        favoriteCount: 22,
        dealScore: 78,
        dealScoreLabel: 'Good Deal',
        marketAvgPrice: 320,
        images: {
          create: [
            { url: 'https://picsum.photos/seed/sony1/800/600', thumbnailUrl: 'https://picsum.photos/seed/sony1/300/225', isCover: true, sortOrder: 0 },
          ],
        },
        shippingOptions: {
          create: [
            { carrier: 'USPS', serviceName: 'USPS Priority Mail', price: 8.99, isFree: false, isDefault: true, estimatedDaysMin: 2, estimatedDaysMax: 4 },
          ],
        },
      },
    }),

    prisma.listing.create({
      data: {
        ...baseListingData(sellers[0].id),
        categoryId: electronicsCategoryId,
        title: 'Samsung Galaxy S24 Ultra 256GB — Titanium Black',
        slug: 'samsung-galaxy-s24-ultra-256gb-ghi789',
        description: 'Samsung Galaxy S24 Ultra with S Pen. 6.8-inch display, 200MP camera, 5000mAh battery. Unlocked, works with all carriers. Minor screen protector scratch (not on screen itself). Full factory reset.',
        condition: ListingCondition.GOOD,
        listingType: ListingType.FIXED_PRICE,
        price: 899,
        originalPrice: 1299,
        offersEnabled: false,
        currency: 'USD',
        quantity: 1,
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        shipsNationally: true,
        viewCount: 523,
        favoriteCount: 31,
        dealScore: 72,
        dealScoreLabel: 'Good Deal',
        marketAvgPrice: 1050,
        images: {
          create: [
            { url: 'https://picsum.photos/seed/s24/800/600', thumbnailUrl: 'https://picsum.photos/seed/s24/300/225', isCover: true, sortOrder: 0 },
          ],
        },
        shippingOptions: {
          create: [
            { carrier: 'UPS', serviceName: 'UPS Ground', price: 0, isFree: true, isDefault: true, estimatedDaysMin: 3, estimatedDaysMax: 5 },
          ],
        },
      },
    }),

    // Automobile listing
    prisma.listing.create({
      data: {
        ...baseListingData(sellers[1].id),
        categoryId: autosCategoryId,
        title: '2021 Tesla Model 3 Long Range — Pearl White',
        slug: '2021-tesla-model-3-long-range-white-jkl012',
        description: 'Excellent condition 2021 Tesla Model 3 Long Range. 358-mile range, Autopilot included, Full Self-Driving capability available. Garage kept, no accidents, one owner. All scheduled maintenance performed at Tesla service center.\n\n**Highlights:**\n- 358 miles EPA range\n- 0-60 mph in 4.2 seconds\n- Autopilot included\n- Premium interior\n- 19" Sport Wheels\n- White Premium Interior',
        condition: ListingCondition.GOOD,
        listingType: ListingType.FIXED_AND_OFFER,
        price: 39500,
        originalPrice: 53000,
        offersEnabled: true,
        autoAcceptPrice: 38000,
        autoDeclinePrice: 35000,
        currency: 'USD',
        quantity: 1,
        city: 'Detroit',
        state: 'MI',
        country: 'US',
        latitude: 42.3314,
        longitude: -83.0458,
        localPickup: true,
        shipsNationally: false,
        viewCount: 1243,
        favoriteCount: 87,
        dealScore: 88,
        dealScoreLabel: 'Great Deal',
        marketAvgPrice: 45000,
        images: {
          create: [
            { url: 'https://picsum.photos/seed/tesla1/800/600', thumbnailUrl: 'https://picsum.photos/seed/tesla1/300/225', isCover: true, sortOrder: 0, altText: 'Tesla Model 3 exterior' },
            { url: 'https://picsum.photos/seed/tesla2/800/600', thumbnailUrl: 'https://picsum.photos/seed/tesla2/300/225', isCover: false, sortOrder: 1, altText: 'Tesla Model 3 interior' },
            { url: 'https://picsum.photos/seed/tesla3/800/600', thumbnailUrl: 'https://picsum.photos/seed/tesla3/300/225', isCover: false, sortOrder: 2, altText: 'Tesla Model 3 dashboard' },
          ],
        },
      },
    }),

    // Fashion listing
    prisma.listing.create({
      data: {
        ...baseListingData(sellers[2].id),
        categoryId: clothingCategoryId,
        title: 'Louis Vuitton Neverfull MM Tote Bag — Damier Ebene',
        slug: 'lv-neverfull-mm-damier-ebene-mno345',
        description: "Authentic Louis Vuitton Neverfull MM in Damier Ebene canvas. Purchased from LV boutique 2 years ago. Gently used, no stains, handles in great condition. Comes with original dust bag and receipt.\n\nAuthenticity can be verified. Serial date code: TH1020.",
        condition: ListingCondition.GOOD,
        listingType: ListingType.FIXED_AND_OFFER,
        price: 1050,
        originalPrice: 1790,
        offersEnabled: true,
        autoAcceptPrice: 975,
        autoDeclinePrice: 850,
        currency: 'USD',
        quantity: 1,
        city: 'New York',
        state: 'NY',
        country: 'US',
        latitude: 40.7128,
        longitude: -74.0060,
        shipsNationally: true,
        viewCount: 689,
        favoriteCount: 54,
        dealScore: 80,
        dealScoreLabel: 'Great Deal',
        marketAvgPrice: 1400,
        images: {
          create: [
            { url: 'https://picsum.photos/seed/lv1/800/600', thumbnailUrl: 'https://picsum.photos/seed/lv1/300/225', isCover: true, sortOrder: 0 },
          ],
        },
        shippingOptions: {
          create: [
            { carrier: 'FEDEX', serviceName: 'FedEx Overnight', price: 24.99, isFree: false, isDefault: true, estimatedDaysMin: 1, estimatedDaysMax: 2 },
          ],
        },
      },
    }),

    // Real estate listing
    prisma.listing.create({
      data: {
        ...baseListingData(sellers[0].id),
        categoryId: realEstateCategoryId,
        title: '3BR/2BA Modern Craftsman Home in Prime Location',
        slug: '3br-2ba-modern-craftsman-home-pqr678',
        description: "Beautiful craftsman-style home, fully renovated in 2022. Open concept living, chef's kitchen with quartz countertops, master suite with spa bath. Landscaped backyard, 2-car garage. Walking distance to top-rated schools and downtown.\n\n**Features:**\n- Hardwood floors throughout\n- New HVAC (2023)\n- Smart home features\n- Solar panels (lease assumable)\n- 2-car garage with EV charging",
        condition: ListingCondition.GOOD,
        listingType: ListingType.FIXED_AND_OFFER,
        price: 875000,
        offersEnabled: true,
        currency: 'USD',
        quantity: 1,
        city: 'Portland',
        state: 'OR',
        country: 'US',
        latitude: 45.5051,
        longitude: -122.6750,
        localPickup: false,
        shipsNationally: false,
        viewCount: 2341,
        favoriteCount: 178,
        dealScore: 65,
        dealScoreLabel: 'Fair Price',
        marketAvgPrice: 892000,
        images: {
          create: [
            { url: 'https://picsum.photos/seed/house1/800/600', thumbnailUrl: 'https://picsum.photos/seed/house1/300/225', isCover: true, sortOrder: 0 },
            { url: 'https://picsum.photos/seed/house2/800/600', thumbnailUrl: 'https://picsum.photos/seed/house2/300/225', isCover: false, sortOrder: 1 },
            { url: 'https://picsum.photos/seed/house3/800/600', thumbnailUrl: 'https://picsum.photos/seed/house3/300/225', isCover: false, sortOrder: 2 },
          ],
        },
      },
    }),
  ]);

  // ─── Platform Fee Config ───
  await prisma.platformFee.createMany({
    data: [
      { name: 'Standard (under $500)', minAmount: null, maxAmount: 500, feePercent: 0.05, isActive: true },
      { name: 'Mid-tier ($500-$5,000)', minAmount: 500, maxAmount: 5000, feePercent: 0.03, isActive: true },
      { name: 'High-value (over $5,000)', minAmount: 5000, maxAmount: null, feePercent: 0.02, isActive: true },
    ],
  });

  // ─── Wishlist items ───
  await prisma.wishlistItem.create({
    data: {
      userId: buyers[0].id,
      listingId: listings[0].id,
      priceAtSave: listings[0].price,
      notifyOnPriceDrop: true,
    },
  });

  await prisma.wishlistItem.create({
    data: {
      userId: buyers[1].id,
      listingId: listings[3].id,
      priceAtSave: listings[3].price,
      notifyOnPriceDrop: false,
    },
  });

  // ─── Sample notifications ───
  await prisma.notification.create({
    data: {
      userId: buyers[0].id,
      type: 'SYSTEM',
      title: 'Welcome to Deal Haven!',
      message: 'Start browsing thousands of listings or sell your items today.',
      actionUrl: '/search',
    },
  });

  console.log('✅ Seeding complete!');
  console.log('\n📋 Demo credentials (password: Password123!):');
  console.log('  Admin:  admin@dealhaven.com');
  console.log('  Seller: techseller@example.com');
  console.log('  Seller: carseller@example.com');
  console.log('  Buyer:  buyer1@example.com');
  console.log(`\n📊 Created:`);
  console.log(`  Categories: ${Object.keys(categoryMap).length}`);
  console.log(`  Users: ${1 + sellers.length + buyers.length}`);
  console.log(`  Listings: ${listings.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
