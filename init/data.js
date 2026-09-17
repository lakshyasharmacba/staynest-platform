const sampleListings = [
  {
    "title": "Cozy Beachfront Cottage",
    "description": "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views, sea breeze, and direct access to the beach.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 1500,
    "location": "Malibu",
    "country": "United States"
  },
  {
    "title": "Modern Loft in Downtown",
    "description": "Stay in the heart of the city in this stylish loft apartment with high ceilings, city skyline views, and nearby dining.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 2200,
    "location": "New York City",
    "country": "United States"
  },
  {
    "title": "Peaceful Mountain Alpine Cabin",
    "description": "Unplug and unwind in this serene mountain cabin surrounded by pine trees, fresh air, and beautiful mountain vistas.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 1800,
    "location": "Aspen",
    "country": "United States"
  },
  {
    "title": "Historic Tuscan Villa",
    "description": "Experience authentic Italian charm in this beautifully restored villa overlooking rolling hills and vineyards.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 3200,
    "location": "Florence",
    "country": "Italy"
  },
  {
    "title": "Secluded Rainforest Treehouse",
    "description": "Live among the lush green treetops in this unique treehouse retreat. A peaceful paradise for nature enthusiasts.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 1100,
    "location": "Portland",
    "country": "United States"
  },
  {
    "title": "Luxury Beachfront Resort Villa",
    "description": "Step directly onto warm sands and turquoise waters. Features a private pool, sun deck, and sunset views.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 4500,
    "location": "Cancun",
    "country": "Mexico"
  },
  {
    "title": "Rustic Lakefront Lodge",
    "description": "Spend your days kayaking and fishing on the glassy lake, and cool evenings by a crackling firepit.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 1350,
    "location": "Lake Tahoe",
    "country": "United States"
  },
  {
    "title": "Luxury Penthouse with City Views",
    "description": "Indulge in panoramic skyline views, contemporary luxury furnishings, and private open-air terrace.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 5200,
    "location": "Los Angeles",
    "country": "United States"
  },
  {
    "title": "Ski Chalet in the Swiss Alps",
    "description": "Hit the slopes right from your doorstep in this cozy chalet nestled in the snow-covered Alps.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 3800,
    "location": "Verbier",
    "country": "Switzerland"
  },
  {
    "title": "Safari Lodge in the Serengeti",
    "description": "Witness magnificent wildlife and the Great Migration up close in a comfortable luxury safari tent lodge.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 4200,
    "location": "Serengeti National Park",
    "country": "Tanzania"
  },
  {
    "title": "Historic Canal House",
    "description": "Stay in a piece of history in this canal house overlooking iconic bridges, waterways, and historic architecture.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 2100,
    "location": "Amsterdam",
    "country": "Netherlands"
  },
  {
    "title": "Overwater Villa in the Maldives",
    "description": "Indulge in pure paradise in an overwater bungalow with direct ocean access and sparkling lagoons.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 6500,
    "location": "Baa Atoll",
    "country": "Maldives"
  },
  {
    "title": "Royal Heritage Haveli",
    "description": "Experience regal Rajasthani warmth in this traditional haveli with carved archways and courtyard.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 2400,
    "location": "Jaipur",
    "country": "India"
  },
  {
    "title": "Serene Tropical Villa in Goa",
    "description": "Private Portuguese-style villa surrounded by lush coconut trees and minutes away from sandy beaches.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 2900,
    "location": "Goa",
    "country": "India"
  },
  {
    "title": "Clifftop Santorini Escape",
    "description": "A bright island retreat with whitewashed walls, a private terrace, and unforgettable Aegean Sea sunsets.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 3600,
    "location": "Santorini",
    "country": "Greece"
  },
  {
    "title": "Forest Glass Cabin",
    "description": "Relax in a modern glass cabin surrounded by tall trees, quiet trails, and peaceful morning views.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 1950,
    "location": "Helsinki",
    "country": "Finland"
  },
  {
    "title": "Desert Camp Under the Stars",
    "description": "Enjoy a comfortable desert stay with warm interiors, open skies, and golden dunes just outside your door.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 1750,
    "location": "Wadi Rum",
    "country": "Jordan"
  },
  {
    "title": "Riverside Kyoto Machiya",
    "description": "Discover Japanese charm in a traditional wooden home close to temples, gardens, and the quiet riverbank.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 2600,
    "location": "Kyoto",
    "country": "Japan"
  },
  {
    "title": "Coastal Clifftop House",
    "description": "Wake up to ocean air in this elegant coastal home with wide windows, a sun deck, and nearby walking paths.",
    "image": {
      "filename": "listingimage",
      "url": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80"
    },
    "price": 3100,
    "location": "Cape Town",
    "country": "South Africa"
  }
];

module.exports = { data: sampleListings };
