import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const persons = await prisma.persons.findMany();
  console.log(persons);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit();
  });
