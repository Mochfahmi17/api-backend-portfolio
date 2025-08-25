import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Mochammad Fahmi Kurnia Sandi",
      email: "mochammadfahmiks@gmail.com",
      password: await bcryptjs.hash("jokokeren17", 10),
    },
  });

  const categoryProject = await prisma.categoryProject.createMany({
    data: [{ name: "Web Developer" }, { name: "Graphic Design" }],
  });

  const level = await prisma.level.createMany({
    data: [
      { name: "Novice", competencyLevel: 10 },
      { name: "Beginner", competencyLevel: 30 },
      { name: "Skillful", competencyLevel: 55 },
      { name: "Experienced", competencyLevel: 75 },
      { name: "Expert", competencyLevel: 90 },
    ],
  });

  console.log("Seed successfully!: ", user);
  console.log("Seed successfully!", categoryProject, level);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
