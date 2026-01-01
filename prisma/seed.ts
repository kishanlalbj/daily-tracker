import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  await prisma.category.createMany({
    data: [
      {
        title: "Food & Drinks"
      },
      {
        title: "Transport"
      },
      {
        title: "Entertainment"
      },
      {
        title: "Health"
      },
      {
        title: "Household"
      },
      {
        title: "Rent"
      },
      {
        title: "Invesments"
      },
      {
        title: "Subscriptions"
      },
      {
        title: "Utilities"
      },
      {
        title: "Miscellaneous"
      }
    ]
  });
}

seed()
  .then(() => {
    console.log("Seed Completed");
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
