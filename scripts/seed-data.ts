import { prisma } from '../lib/prisma';
import { slugify } from '../lib/utils';

export const POPULAR_BD_PARTS = [
  // CPUs
  {
    name: 'AMD Ryzen 5 5600 Processor',
    category: 'CPU',
    socket: 'AM4',
    ramType: 'DDR4',
    tdpWatts: 65,
    hasIgpu: false,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/processor/amd/5600x/5600x-001-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 12200, regularPrice: 14000, url: 'https://www.startech.com.bd/amd-ryzen-5-5600-processor' },
      { retailer: 'UCC_BD', price: 12350, regularPrice: 13900, url: 'https://www.ucc.com.bd/amd-ryzen-5-5600-processor' },
      { retailer: 'RYANS', price: 12500, regularPrice: 14200, url: 'https://www.ryans.com/search?q=ryzen+5600' },
    ],
  },
  {
    name: 'AMD Ryzen 5 5600G Processor with Radeon Graphics',
    category: 'CPU',
    socket: 'AM4',
    ramType: 'DDR4',
    tdpWatts: 65,
    hasIgpu: true,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/processor/AMD/ryzen-5-5600g/ryzen-5-5600g-01-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 13500, regularPrice: 15500, url: 'https://www.startech.com.bd/amd-ryzen-5-5600g-processor' },
      { retailer: 'UCC_BD', price: 13550, regularPrice: 15200, url: 'https://www.ucc.com.bd/amd-ryzen-5-5600g-processor-with-radeon-graphics' },
      { retailer: 'RYANS', price: 13700, regularPrice: 15800, url: 'https://www.ryans.com/search?q=5600g' },
    ],
  },
  {
    name: 'AMD Ryzen 5 7600 Gaming Processor',
    category: 'CPU',
    socket: 'AM5',
    ramType: 'DDR5',
    tdpWatts: 65,
    hasIgpu: true,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/processor/AMD/ryzen-5-7600/ryzen-5-7600-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 21500, regularPrice: 23500, url: 'https://www.startech.com.bd/amd-ryzen-5-7600-processor' },
      { retailer: 'UCC_BD', price: 21450, regularPrice: 23200, url: 'https://www.ucc.com.bd/amd-brand-processors' },
      { retailer: 'RYANS', price: 21800, regularPrice: 23900, url: 'https://www.ryans.com/search?q=ryzen+7600' },
    ],
  },
  {
    name: 'Intel Core i3-12100 12th Gen Alder Lake Processor',
    category: 'CPU',
    socket: 'LGA1700',
    ramType: 'DDR4',
    tdpWatts: 60,
    hasIgpu: true,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/processor/Intel/i3-12100/i3-12100-01-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 11400, regularPrice: 13000, url: 'https://www.startech.com.bd/intel-core-i3-12100-processor' },
      { retailer: 'UCC_BD', price: 11300, regularPrice: 12800, url: 'https://www.ucc.com.bd/intel-brand-processors' },
      { retailer: 'RYANS', price: 11600, regularPrice: 13200, url: 'https://www.ryans.com/search?q=12100' },
    ],
  },
  {
    name: 'Intel Core i5-12400F 12th Gen Alder Lake Processor',
    category: 'CPU',
    socket: 'LGA1700',
    ramType: 'DDR4',
    tdpWatts: 65,
    hasIgpu: false,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/processor/Intel/i5-12400f/i5-12400f-01-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 13800, regularPrice: 15500, url: 'https://www.startech.com.bd/intel-core-i5-12400f-processor' },
      { retailer: 'UCC_BD', price: 13850, regularPrice: 15400, url: 'https://www.ucc.com.bd/intel-brand-processors' },
      { retailer: 'RYANS', price: 14100, regularPrice: 15800, url: 'https://www.ryans.com/search?q=12400f' },
    ],
  },

  // Motherboards
  {
    name: 'MSI B450M-A PRO MAX II AMD AM4 Motherboard',
    category: 'MOTHERBOARD',
    socket: 'AM4',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/motherboard/msi/b450m-a-pro-max-ii/b450m-a-pro-max-ii-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 7800, regularPrice: 8500, url: 'https://www.startech.com.bd/msi-b450m-a-pro-max-ii-motherboard' },
      { retailer: 'UCC_BD', price: 7750, regularPrice: 8400, url: 'https://www.ucc.com.bd/msi-brand-motherboards' },
      { retailer: 'RYANS', price: 7900, regularPrice: 8600, url: 'https://www.ryans.com/search?q=b450m' },
    ],
  },
  {
    name: 'MSI B550M PRO-VDH WIFI AMD AM4 Motherboard',
    category: 'MOTHERBOARD',
    socket: 'AM4',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/motherboard/msi/b550m-pro-vdh-wifi/b550m-pro-vdh-wifi-01-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 12800, regularPrice: 14000, url: 'https://www.startech.com.bd/msi-b550m-pro-vdh-wifi-motherboard' },
      { retailer: 'UCC_BD', price: 12850, regularPrice: 14200, url: 'https://www.ucc.com.bd/msi-brand-motherboards' },
      { retailer: 'RYANS', price: 13100, regularPrice: 14500, url: 'https://www.ryans.com/search?q=b550m+vdh' },
    ],
  },
  {
    name: 'Gigabyte H610M H V2 DDR4 12th/13th/14th Gen Motherboard',
    category: 'MOTHERBOARD',
    socket: 'LGA1700',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/motherboard/gigabyte/h610m-h-v2-ddr4/h610m-h-v2-ddr4-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 8900, regularPrice: 9800, url: 'https://www.startech.com.bd/gigabyte-h610m-h-v2-ddr4-motherboard' },
      { retailer: 'UCC_BD', price: 8850, regularPrice: 9700, url: 'https://www.ucc.com.bd/h610-motherboard' },
      { retailer: 'RYANS', price: 9100, regularPrice: 10000, url: 'https://www.ryans.com/search?q=h610m' },
    ],
  },
  {
    name: 'ASUS PRIME B650M-A WIFI II AMD AM5 DDR5 Motherboard',
    category: 'MOTHERBOARD',
    socket: 'AM5',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/motherboard/asus/prime-b650m-a-wifi-ii/prime-b650m-a-wifi-ii-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 19800, regularPrice: 21500, url: 'https://www.startech.com.bd/asus-prime-b650m-a-wifi-ii-motherboard' },
      { retailer: 'UCC_BD', price: 19650, regularPrice: 21200, url: 'https://www.ucc.com.bd/b650-motherboard' },
      { retailer: 'RYANS', price: 20200, regularPrice: 22000, url: 'https://www.ryans.com/search?q=b650m' },
    ],
  },

  // RAM
  {
    name: 'Corsair Vengeance LPX 16GB (1x16GB) DDR4 3200MHz RAM',
    category: 'RAM',
    ramType: 'DDR4',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/ram/corsair/vengeance-lpx-16gb/vengeance-lpx-16gb-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 4200, regularPrice: 4800, url: 'https://www.startech.com.bd/corsair-vengeance-lpx-16gb-ddr4-3200mhz-ram' },
      { retailer: 'UCC_BD', price: 4150, regularPrice: 4700, url: 'https://www.ucc.com.bd/ddr4-desktop-ram' },
      { retailer: 'RYANS', price: 4300, regularPrice: 4900, url: 'https://www.ryans.com/search?q=corsair+16gb' },
    ],
  },
  {
    name: 'G.Skill Ripjaws V 16GB (2x8GB) DDR4 3200MHz Dual Channel RAM',
    category: 'RAM',
    ramType: 'DDR4',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/ram/g-skill/ripjaws-v/ripjaws-v-16gb-3200mhz-01-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 4600, regularPrice: 5200, url: 'https://www.startech.com.bd/gskill-ripjaws-v-16gb-ddr4-3200mhz-ram' },
      { retailer: 'UCC_BD', price: 4550, regularPrice: 5100, url: 'https://www.ucc.com.bd/ddr4-desktop-ram' },
      { retailer: 'RYANS', price: 4700, regularPrice: 5300, url: 'https://www.ryans.com/search?q=ripjaws+16gb' },
    ],
  },
  {
    name: 'Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL36 RAM',
    category: 'RAM',
    ramType: 'DDR5',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/ram/corsair/vengeance-32gb-ddr5-6000mhz/vengeance-32gb-ddr5-6000mhz-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 13500, regularPrice: 14800, url: 'https://www.startech.com.bd/corsair-vengeance-32gb-ddr5-6000mhz-ram' },
      { retailer: 'UCC_BD', price: 13450, regularPrice: 14600, url: 'https://www.ucc.com.bd/ddr5-desktop-ram-price-in-bangladesh' },
      { retailer: 'RYANS', price: 13800, regularPrice: 15200, url: 'https://www.ryans.com/search?q=ddr5+32gb' },
    ],
  },

  // Storage
  {
    name: 'Kingston NV2 500GB PCIe 4.0 NVMe M.2 SSD',
    category: 'STORAGE',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/ssd/kingston/nv2-500gb/nv2-500gb-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 3800, regularPrice: 4200, url: 'https://www.startech.com.bd/kingston-nv2-500gb-pcie-4-0-nvme-ssd' },
      { retailer: 'UCC_BD', price: 3750, regularPrice: 4100, url: 'https://www.ucc.com.bd/pcie-m.2-ssds' },
      { retailer: 'RYANS', price: 3900, regularPrice: 4400, url: 'https://www.ryans.com/search?q=nv2+500gb' },
    ],
  },
  {
    name: 'Samsung 980 1TB PCIe 3.0 NVMe M.2 SSD',
    category: 'STORAGE',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/ssd/samsung/980-1tb/980-1tb-01-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 9200, regularPrice: 10500, url: 'https://www.startech.com.bd/samsung-980-1tb-m-2-nvme-ssd' },
      { retailer: 'UCC_BD', price: 9150, regularPrice: 10200, url: 'https://www.ucc.com.bd/solid-state-drives' },
      { retailer: 'RYANS', price: 9500, regularPrice: 10800, url: 'https://www.ryans.com/search?q=samsung+980' },
    ],
  },

  // GPUs
  {
    name: 'Sapphire PULSE AMD Radeon RX 6600 8GB GDDR6 Graphics Card',
    category: 'GPU',
    tdpWatts: 140,
    recommendedPsu: 500,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/graphics-card/sapphire/pulse-rx-6600/pulse-rx-6600-01-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 26500, regularPrice: 28500, url: 'https://www.startech.com.bd/sapphire-pulse-radeon-rx-6600-graphics-card' },
      { retailer: 'UCC_BD', price: 26300, regularPrice: 28000, url: 'https://www.ucc.com.bd/sapphire-graphics-cards' },
      { retailer: 'RYANS', price: 26900, regularPrice: 29000, url: 'https://www.ryans.com/search?q=rx+6600' },
    ],
  },
  {
    name: 'ZOTAC GAMING GeForce RTX 4060 8GB Twin Edge OC Graphics Card',
    category: 'GPU',
    tdpWatts: 115,
    recommendedPsu: 550,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/graphics-card/zotac/rtx-4060-twin-edge-oc/rtx-4060-twin-edge-oc-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 38500, regularPrice: 42000, url: 'https://www.startech.com.bd/zotac-gaming-geforce-rtx-4060-twin-edge-oc-8gb-graphics-card' },
      { retailer: 'UCC_BD', price: 38200, regularPrice: 41500, url: 'https://www.ucc.com.bd/Zotac-graphics-cards' },
      { retailer: 'RYANS', price: 39000, regularPrice: 42500, url: 'https://www.ryans.com/search?q=rtx+4060' },
    ],
  },
  {
    name: 'GIGABYTE GeForce RTX 4070 SUPER WINDFORCE OC 12GB Graphics Card',
    category: 'GPU',
    tdpWatts: 220,
    recommendedPsu: 650,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/graphics-card/gigabyte/geforce-rtx-4070-super-windforce-oc-12g/geforce-rtx-4070-super-windforce-oc-12g-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 79500, regularPrice: 85000, url: 'https://www.startech.com.bd/gigabyte-geforce-rtx-4070-super-windforce-oc-12g-graphics-card' },
      { retailer: 'UCC_BD', price: 79200, regularPrice: 84500, url: 'https://www.ucc.com.bd/graphics-card' },
      { retailer: 'RYANS', price: 81000, regularPrice: 86500, url: 'https://www.ryans.com/search?q=rtx+4070+super' },
    ],
  },

  // PSUs
  {
    name: 'DeepCool PK550D 550W 80 PLUS Bronze Power Supply',
    category: 'PSU',
    tdpWatts: 550,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/power-supply/deepcool/pk550d/pk550d-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 4400, regularPrice: 4900, url: 'https://www.startech.com.bd/deepcool-pk550d-550w-power-supply' },
      { retailer: 'UCC_BD', price: 4350, regularPrice: 4800, url: 'https://www.ucc.com.bd/power-supply-unit' },
      { retailer: 'RYANS', price: 4500, regularPrice: 5000, url: 'https://www.ryans.com/search?q=pk550d' },
    ],
  },
  {
    name: 'Corsair CV650 650W 80 PLUS Bronze Power Supply',
    category: 'PSU',
    tdpWatts: 650,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/power-supply/corsair/cv650/cv650-01-228x228.jpg',
    prices: [
      { retailer: 'STAR_TECH', price: 5800, regularPrice: 6500, url: 'https://www.startech.com.bd/corsair-cv650-650w-power-supply' },
      { retailer: 'UCC_BD', price: 5750, regularPrice: 6400, url: 'https://www.ucc.com.bd/power-supply-unit' },
      { retailer: 'RYANS', price: 5900, regularPrice: 6600, url: 'https://www.ryans.com/search?q=cv650' },
    ],
  },
  {
    name: 'Antec CSK 750W 80 PLUS Bronze Power Supply',
    category: 'PSU',
    tdpWatts: 750,
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/power-supply/antec/csk-750w/csk-750w-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 7200, regularPrice: 7900, url: 'https://www.startech.com.bd/antec-csk-750w-bronze-power-supply' },
      { retailer: 'UCC_BD', price: 7150, regularPrice: 7800, url: 'https://www.ucc.com.bd/power-supply-unit' },
      { retailer: 'RYANS', price: 7400, regularPrice: 8100, url: 'https://www.ryans.com/search?q=csk+750' },
    ],
  },

  // Casing
  {
    name: 'Antec NX292 RGB Mid-Tower Gaming Casing',
    category: 'CASING',
    formFactor: 'ATX',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/casing/antec/nx292/nx292-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 3700, regularPrice: 4200, url: 'https://www.startech.com.bd/antec-nx292-rgb-gaming-casing' },
      { retailer: 'UCC_BD', price: 3650, regularPrice: 4100, url: 'https://www.ucc.com.bd/casing-chassis' },
      { retailer: 'RYANS', price: 3800, regularPrice: 4300, url: 'https://www.ryans.com/search?q=nx292' },
    ],
  },
  {
    name: 'Montech AIR 100 ARGB Micro-ATX Gaming Casing',
    category: 'CASING',
    formFactor: 'Micro-ATX',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/casing/montech/air-100-argb/air-100-argb-black-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 4800, regularPrice: 5300, url: 'https://www.startech.com.bd/montech-air-100-argb-micro-atx-gaming-casing' },
      { retailer: 'UCC_BD', price: 4750, regularPrice: 5200, url: 'https://www.ucc.com.bd/casing-chassis' },
      { retailer: 'RYANS', price: 4900, regularPrice: 5400, url: 'https://www.ryans.com/search?q=air+100' },
    ],
  },

  // Monitors
  {
    name: 'MSI PRO MP223 21.45" 100Hz Full HD Monitor',
    category: 'MONITOR',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/monitor/msi/pro-mp223/pro-mp223-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 9200, regularPrice: 10500, url: 'https://www.startech.com.bd/msi-pro-mp223-21-45-inch-full-hd-monitor' },
      { retailer: 'UCC_BD', price: 9100, regularPrice: 10200, url: 'https://www.ucc.com.bd/msi-brand-monitors' },
      { retailer: 'RYANS', price: 9350, regularPrice: 10600, url: 'https://www.ryans.com/search?q=mp223' },
    ],
  },
  {
    name: 'GIGABYTE G24F 2 23.8" 180Hz 1ms IPS Gaming Monitor',
    category: 'MONITOR',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/monitor/gigabyte/g24f-2/g24f-2-01-228x228.webp',
    prices: [
      { retailer: 'STAR_TECH', price: 18500, regularPrice: 20000, url: 'https://www.startech.com.bd/gigabyte-g24f-2-gaming-monitor' },
      { retailer: 'UCC_BD', price: 18350, regularPrice: 19800, url: 'https://www.ucc.com.bd/monitors' },
      { retailer: 'RYANS', price: 18800, regularPrice: 20500, url: 'https://www.ryans.com/search?q=g24f' },
    ],
  },
];

export async function seedPopularHardware() {
  console.log('Seeding popular Bangladesh hardware catalog...');

  for (const item of POPULAR_BD_PARTS) {
    const slug = slugify(item.name);
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        socket: item.socket || undefined,
        ramType: item.ramType || undefined,
        formFactor: item.formFactor || undefined,
        tdpWatts: item.tdpWatts || undefined,
        recommendedPsu: item.recommendedPsu || undefined,
        hasIgpu: item.hasIgpu || false,
        imageUrl: item.imageUrl,
      },
      create: {
        name: item.name,
        slug,
        category: item.category,
        socket: item.socket,
        ramType: item.ramType,
        formFactor: item.formFactor,
        tdpWatts: item.tdpWatts,
        recommendedPsu: item.recommendedPsu,
        hasIgpu: item.hasIgpu || false,
        imageUrl: item.imageUrl,
      },
    });

    for (const pr of item.prices) {
      await prisma.retailerPrice.upsert({
        where: {
          productId_retailer: {
            productId: product.id,
            retailer: pr.retailer,
          },
        },
        update: {
          price: pr.price,
          regularPrice: pr.regularPrice,
          url: pr.url,
          imageUrl: item.imageUrl,
          inStock: true,
          lastChecked: new Date(),
        },
        create: {
          productId: product.id,
          retailer: pr.retailer,
          retailerName: item.name,
          price: pr.price,
          regularPrice: pr.regularPrice,
          url: pr.url,
          imageUrl: item.imageUrl,
          inStock: true,
          lastChecked: new Date(),
        },
      });
    }
  }

  console.log(`✓ Seeded ${POPULAR_BD_PARTS.length} master components across Star Tech, UCC BD, and Ryans!`);
}

if (require.main === module) {
  seedPopularHardware()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
