import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

// Real (DB-backed) categories. "New Arrivals" and "Best Sellers" are
// query-filtered views on /products (sort=new / sort=featured), not
// categories — see docs/TRD.md's note that these "may be computed/tagged
// rather than manually assigned."
const CATEGORIES = [
  { name: "Joggers", slug: "joggers", sortOrder: 0 },
  { name: "Shirts", slug: "shirts", sortOrder: 1 },
  { name: "Face Caps", slug: "face-caps", sortOrder: 2 },
];

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin user creation.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {},
    create: {
      name: "Luwa",
      email: adminEmail.toLowerCase(),
      phoneNumber: "0000000000",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Seeded admin user: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
