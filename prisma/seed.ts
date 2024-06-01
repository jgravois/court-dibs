import { PrismaClient } from "@prisma/client";
import { addHours, addMinutes, startOfTomorrow } from "date-fns";

const prisma = new PrismaClient();

async function seed() {
  const email = "jagravois" + "@g" + "mail.com";

  // cleanup the existing database
  // no worries if records dont exist yet
  await prisma.user.deleteMany().catch(() => {
    // no worries if records dont exist yet
  });
  await prisma.reservation.deleteMany();

  const user = await prisma.user.create({
    data: {
      email,
      stytchId: "user-test-56e85954-ddf4-49eb-be5e-3901b0267f62",
    },
  });

  const tomorrow = addHours(startOfTomorrow(), 10);
  await prisma.reservation.create({
    data: {
      start: tomorrow,
      end: addMinutes(tomorrow, 30),
      userId: user.id,
      court: "pb", // 'pb' | 'bball' | '10s'
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
