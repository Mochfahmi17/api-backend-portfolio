"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const user = await prisma.user.create({
        data: {
            name: "Mochammad Fahmi Kurnia Sandi",
            email: "mochammadfahmiks@gmail.com",
            password: await bcryptjs_1.default.hash("jokokeren17", 10),
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
