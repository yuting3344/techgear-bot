export interface Laptop {
  id: string
  name: string
  brand: string
  price: string
  priceUSD: number
  category: 'ultrabook' | 'gaming' | 'workstation' | 'budget' | 'convertible'
  specs: {
    cpu: string
    ram: string
    storage: string
    display: string
    battery: string
    weight: string
    gpu?: string
  }
  tags: string[]
  description: string
  amazonUrl: string
  amazonAsin: string
  imageUrl: string
}

export const laptops: Laptop[] = [
  {
    id: 'macbook-air-m2',
    name: 'MacBook Air M2 (13-inch, 2022)',
    brand: 'Apple',
    price: 'NT$35,900',
    priceUSD: 1099,
    category: 'ultrabook',
    specs: {
      cpu: 'Apple M2 (8-core)',
      ram: '8GB unified memory',
      storage: '256GB SSD',
      display: '13.6" Liquid Retina 2560x1664',
      battery: 'Up to 18 hours',
      weight: '1.24 kg',
    },
    tags: ['輕薄', '長續航', '創作'],
    description: '搭載 M2 晶片，業界最長 18 小時續航，重量僅 1.24 kg，是出差與創作者首選。',
    amazonUrl: 'https://www.amazon.com/dp/B0B3BVWJ6Y',
    amazonAsin: 'B0B3BVWJ6Y',
    imageUrl: '/images/macbook-air-m2.jpg',
  },
  {
    id: 'dell-xps-15-9530',
    name: 'Dell XPS 15 9530',
    brand: 'Dell',
    price: 'NT$62,000',
    priceUSD: 1899,
    category: 'workstation',
    specs: {
      cpu: 'Intel Core i7-13620H',
      ram: '16GB DDR5',
      storage: '512GB NVMe SSD',
      display: '15.6" FHD+ 1920x1200 IPS',
      battery: 'Up to 13 hours',
      weight: '1.92 kg',
      gpu: 'NVIDIA GeForce RTX 4060',
    },
    tags: ['影像剪輯', '高效能', '4K'],
    description: 'RTX 4060 獨顯，13 代 i7，適合影像剪輯、3D 設計與重度辦公需求。',
    amazonUrl: 'https://www.amazon.com/dp/B0CC2566C5',
    amazonAsin: 'B0CC2566C5',
    imageUrl: '/images/dell-xps-15.jpg',
  },
  {
    id: 'lenovo-thinkpad-x1-carbon',
    name: 'Lenovo ThinkPad X1 Carbon Gen 10',
    brand: 'Lenovo',
    price: 'NT$42,000',
    priceUSD: 1299,
    category: 'ultrabook',
    specs: {
      cpu: 'Intel Core i7-1260P',
      ram: '16GB DDR5',
      storage: '1TB NVMe SSD',
      display: '14" WUXGA 1920x1200 IPS Anti-Glare',
      battery: 'Up to 15 hours',
      weight: '1.12 kg',
    },
    tags: ['商務', '輕薄', '鍵盤舒適'],
    description: '經典商務機皇，1.12 kg 超輕機身，鍵盤手感頂級，MIL-SPEC 軍規認證。',
    amazonUrl: 'https://www.amazon.com/dp/B09MRBWXTQ',
    amazonAsin: 'B09MRBWXTQ',
    imageUrl: '/images/thinkpad-x1.png',
  },
  {
    id: 'asus-rog-zephyrus-g16',
    name: 'ASUS ROG Zephyrus G16 (2024)',
    brand: 'ASUS',
    price: 'NT$65,000',
    priceUSD: 1999,
    category: 'gaming',
    specs: {
      cpu: 'Intel Core Ultra 9 185H',
      ram: '16GB DDR5X',
      storage: '1TB NVMe Gen 5',
      display: '16" QHD+ OLED 240Hz 2560x1600',
      battery: 'Up to 10 hours',
      weight: '1.95 kg',
      gpu: 'NVIDIA GeForce RTX 4070',
    },
    tags: ['遊戲', 'OLED', '高刷新率'],
    description: '240Hz OLED 螢幕，RTX 4070，Core Ultra 9，兼顧遊戲效能與輕薄設計。',
    amazonUrl: 'https://www.amazon.com/dp/B0D7MGD2BF',
    amazonAsin: 'B0D7MGD2BF',
    imageUrl: '/images/gaming-laptop.jpg',
  },
  {
    id: 'hp-spectre-x360',
    name: 'HP Spectre x360 16 (2-in-1)',
    brand: 'HP',
    price: 'NT$52,000',
    priceUSD: 1599,
    category: 'convertible',
    specs: {
      cpu: 'Intel Core i7-12700H',
      ram: '16GB LPDDR5',
      storage: '512GB SSD',
      display: '16" 3K+ Touch 3072x1920',
      battery: 'Up to 17 hours',
      weight: '2.19 kg',
    },
    tags: ['翻轉', '觸控', '附手寫筆'],
    description: '3K+ 觸控螢幕，可 360 度翻轉，附 OMEN Stylus 手寫筆，兼顧創作與商務。',
    amazonUrl: 'https://www.amazon.com/dp/B0BFBJYLB5',
    amazonAsin: 'B0BFBJYLB5',
    imageUrl: '/images/hp-spectre-x360.jpg',
  },
]

export function findLaptops(query: string): Laptop[] {
  const q = query.toLowerCase()
  return laptops.filter((l) => {
    const text = [l.name, l.brand, l.description, ...l.tags, l.category].join(' ').toLowerCase()
    return text.includes(q)
  })
}

export function getLaptopsByCategory(category: Laptop['category']): Laptop[] {
  return laptops.filter((l) => l.category === category)
}
