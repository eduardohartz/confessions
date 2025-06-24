import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.confession.deleteMany()
  await prisma.rateLimit.deleteMany()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    console.log("Seeding completed successfully.")
    await prisma.$disconnect()
  })
