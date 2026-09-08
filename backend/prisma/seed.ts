import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.productBrand.deleteMany();
  await prisma.productConditionOption.deleteMany();
  await prisma.productStatusOption.deleteMany();

  const defaultBrands = ["adidas", "Nike", "PUMA", "New Balance", "Under Armour", "ASICS", "Skechers", "Jordan", "Converse", "Reebok", "FILA", "Hummel", "Veja"];
  const defaultConditions = ["new", "used"];
  const defaultStatuses = ["active", "draft"];

  await prisma.productBrand.createMany({
    data: defaultBrands.map((name) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })),
  });

  await prisma.productConditionOption.createMany({
    data: defaultConditions.map((name) => ({ name, slug: name.toLowerCase() })),
  });

  await prisma.productStatusOption.createMany({
    data: defaultStatuses.map((name) => ({ name, slug: name.toLowerCase() })),
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@shopco.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "admin",
    },
  });
  console.log(`Admin user ready: ${adminEmail} / ${adminPassword}`);

  const bootsCleats = await prisma.category.create({
    data: {
      name: "Boots & Cleats",
      slug: "boots-cleats",
      description: "Football boots and cleats for every surface.",
    },
  });
  const studs = await prisma.subCategory.create({
    data: {
      name: "Studs (FG)",
      slug: "studs-fg",
      description: "Firm ground boots for natural grass pitches.",
      categoryId: bootsCleats.id,
    },
  });
  const grippers = await prisma.subCategory.create({
    data: {
      name: "Grippers (AG/TF)",
      slug: "grippers-ag-tf",
      description: "Artificial grass and turf boots.",
      categoryId: bootsCleats.id,
    },
  });

  const jerseysKits = await prisma.category.create({
    data: {
      name: "Jerseys & Kits",
      slug: "jerseys-kits",
      description: "Home, away, and training kits.",
    },
  });
  const homeKits = await prisma.subCategory.create({
    data: {
      name: "Home Kits",
      slug: "home-kits",
      description: "Home jerseys and kit sets.",
      categoryId: jerseysKits.id,
    },
  });
  const awayKits = await prisma.subCategory.create({
    data: {
      name: "Away Kits",
      slug: "away-kits",
      description: "Away jerseys and kit sets.",
      categoryId: jerseysKits.id,
    },
  });

  const balls = await prisma.category.create({
    data: { name: "Balls", slug: "balls", description: "Match and training footballs." },
  });
  const gloves = await prisma.category.create({
    data: {
      name: "Goalkeeper Gloves",
      slug: "goalkeeper-gloves",
      description: "Gloves for shot-stoppers.",
    },
  });
  const shinGuards = await prisma.category.create({
    data: {
      name: "Shin Guards",
      slug: "shin-guards",
      description: "Protective shin guards.",
    },
  });
  const socks = await prisma.category.create({
    data: {
      name: "Socks & Accessories",
      slug: "socks-accessories",
      description: "Match socks and other accessories.",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        title: "Predator Elite FG Boots",
        slug: "predator-elite-fg-boots",
        description:
          "Pre-owned adidas Predator boots, inspected for authenticity and playing condition. Firm ground studs for natural grass pitches.",
        srcUrl: "/images/football/boot.svg",
        gallery: ["/images/football/boot.svg"],
        brand: "adidas",
        condition: "used",
        size: "UK 9",
        price: 18500,
        discountPercentage: 0,
        stock: 6,
        status: "active",
        rating: 4.5,
        categoryId: bootsCleats.id,
        subCategoryId: studs.id,
      },
      {
        title: "Mercurial Vapor 15 Boots",
        slug: "mercurial-vapor-15-boots",
        description:
          "Lightweight Nike Mercurial boots built for speed. Gently used, uppers and studs in great condition.",
        srcUrl: "/images/football/boot.svg",
        gallery: ["/images/football/boot.svg"],
        brand: "Nike",
        condition: "used",
        size: "UK 8",
        price: 22000,
        discountPercentage: 15,
        stock: 4,
        status: "active",
        rating: 4.5,
        categoryId: bootsCleats.id,
        subCategoryId: studs.id,
      },
      {
        title: "Future Z Boots",
        slug: "future-z-boots",
        description:
          "Pre-owned PUMA Future Z boots, flexible knit upper, checked and cleaned before listing.",
        srcUrl: "/images/football/boot.svg",
        gallery: ["/images/football/boot.svg"],
        brand: "PUMA",
        condition: "used",
        size: "UK 8",
        price: 16000,
        discountPercentage: 25,
        stock: 3,
        status: "active",
        rating: 3.5,
        categoryId: bootsCleats.id,
        subCategoryId: grippers.id,
      },
      {
        title: "Kids Predator Boots",
        slug: "kids-predator-boots",
        description:
          "Pre-loved kids' boots, thoroughly checked for wear before listing. Great starter pair for young players.",
        srcUrl: "/images/football/boot.svg",
        gallery: ["/images/football/boot.svg"],
        brand: "adidas",
        condition: "used",
        size: "UK 2",
        price: 9000,
        discountPercentage: 20,
        stock: 5,
        status: "active",
        rating: 4.5,
        categoryId: bootsCleats.id,
        subCategoryId: studs.id,
      },
      {
        title: "Home Match Jersey 23/24",
        slug: "home-match-jersey-23-24",
        description: "Official home jersey, brand new with tags. Breathable match-day fabric.",
        srcUrl: "/images/football/jersey.svg",
        gallery: ["/images/football/jersey.svg"],
        brand: "adidas",
        condition: "new",
        size: "M",
        price: 6500,
        discountPercentage: 0,
        stock: 0,
        status: "draft",
        rating: 4.5,
        categoryId: jerseysKits.id,
        subCategoryId: homeKits.id,
      },
      {
        title: "Away Match Jersey 23/24",
        slug: "away-match-jersey-23-24",
        description: "Official away kit jersey, brand new with tags.",
        srcUrl: "/images/football/jersey.svg",
        gallery: ["/images/football/jersey.svg"],
        brand: "Nike",
        condition: "new",
        size: "L",
        price: 7000,
        discountPercentage: 0,
        stock: 20,
        status: "active",
        rating: 5,
        categoryId: jerseysKits.id,
        subCategoryId: awayKits.id,
      },
      {
        title: "Kids Football Kit Set",
        slug: "kids-football-kit-set",
        description: "Full kids' kit: jersey, shorts, and socks. Brand new.",
        srcUrl: "/images/football/jersey.svg",
        gallery: ["/images/football/jersey.svg"],
        brand: "PUMA",
        condition: "new",
        size: "S",
        price: 5500,
        discountPercentage: 30,
        stock: 10,
        status: "active",
        rating: 5,
        categoryId: jerseysKits.id,
        subCategoryId: homeKits.id,
      },
      {
        title: "Match Football (Size 5)",
        slug: "match-football-size-5",
        description: "FIFA-quality size 5 match ball, brand new.",
        srcUrl: "/images/football/ball.svg",
        gallery: ["/images/football/ball.svg"],
        brand: "PUMA",
        condition: "new",
        size: "Size 5",
        price: 4500,
        discountPercentage: 0,
        stock: 35,
        status: "active",
        rating: 4,
        categoryId: balls.id,
      },
      {
        title: "Goalkeeper Gloves Pro",
        slug: "goalkeeper-gloves-pro",
        description:
          "Pre-owned goalkeeper gloves with strong grip remaining. Latex palm inspected for tears.",
        srcUrl: "/images/football/gloves.svg",
        gallery: ["/images/football/gloves.svg"],
        brand: "Under Armour",
        condition: "used",
        size: "M",
        price: 5000,
        discountPercentage: 10,
        stock: 12,
        status: "active",
        rating: 4,
        categoryId: gloves.id,
      },
      {
        title: "Football Socks (Pack of 2)",
        slug: "football-socks-pack-of-2",
        description: "Cushioned match socks, brand new, pack of two pairs.",
        srcUrl: "/images/football/socks.svg",
        gallery: ["/images/football/socks.svg"],
        brand: "Nike",
        condition: "new",
        size: "M",
        price: 1500,
        discountPercentage: 0,
        stock: 40,
        status: "active",
        rating: 4.5,
        categoryId: socks.id,
      },
      {
        title: "Shin Guards Elite",
        slug: "shin-guards-elite",
        description: "Lightweight shin guards with ankle protection, brand new.",
        srcUrl: "/images/football/shinguard.svg",
        gallery: ["/images/football/shinguard.svg"],
        brand: "Nike",
        condition: "new",
        size: "M",
        price: 2800,
        discountPercentage: 0,
        stock: 25,
        status: "active",
        rating: 4,
        categoryId: shinGuards.id,
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
