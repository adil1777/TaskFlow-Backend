import "dotenv/config";

import {
  PrismaClient,
  OrgRole,
  Status,
  Priority,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 12);

  // --------------------------------------------------
  // Organizations
  // --------------------------------------------------

  const organizationA = await prisma.organization.create({
    data: {
      name: "Acme Technologies",
    },
  });

  const organizationB = await prisma.organization.create({
    data: {
      name: "Globex Solutions",
    },
  });

  // --------------------------------------------------
  // Users
  // --------------------------------------------------

  const adminA = await prisma.user.create({
    data: {
      name: "Adil Admin",
      email: "admin@acme.com",
      passwordHash,
    },
  });

  const memberA1 = await prisma.user.create({
    data: {
      name: "Rahul Kumar",
      email: "rahul@acme.com",
      passwordHash,
    },
  });

  const memberA2 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@acme.com",
      passwordHash,
    },
  });

  const adminB = await prisma.user.create({
    data: {
      name: "John Admin",
      email: "admin@globex.com",
      passwordHash,
    },
  });

  const memberB = await prisma.user.create({
    data: {
      name: "Sarah Wilson",
      email: "sarah@globex.com",
      passwordHash,
    },
  });

  // --------------------------------------------------
  // Organization Memberships
  // --------------------------------------------------

  await prisma.orgMember.createMany({
    data: [
      {
        userId: adminA.id,
        organizationId: organizationA.id,
        role: OrgRole.org_admin,
      },
      {
        userId: memberA1.id,
        organizationId: organizationA.id,
        role: OrgRole.member,
      },
      {
        userId: memberA2.id,
        organizationId: organizationA.id,
        role: OrgRole.member,
      },
      {
        userId: adminB.id,
        organizationId: organizationB.id,
        role: OrgRole.org_admin,
      },
      {
        userId: memberB.id,
        organizationId: organizationB.id,
        role: OrgRole.member,
      },
    ],
  });

  // --------------------------------------------------
  // Projects - Organization A
  // --------------------------------------------------

  const ecommerceProject = await prisma.project.create({
    data: {
      organizationId: organizationA.id,
      name: "E-Commerce Platform",
      description: "Build the new e-commerce platform.",
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      organizationId: organizationA.id,
      name: "Mobile Application",
      description: "Develop the TaskFlow mobile application.",
    },
  });

  // --------------------------------------------------
  // Projects - Organization B
  // --------------------------------------------------

  const crmProject = await prisma.project.create({
    data: {
      organizationId: organizationB.id,
      name: "CRM System",
      description: "Build a customer relationship management system.",
    },
  });

  // --------------------------------------------------
  // Tasks - Project 1
  // --------------------------------------------------

  const task1 = await prisma.task.create({
    data: {
      projectId: ecommerceProject.id,
      title: "Design login page",
      description: "Create responsive login page UI.",
      status: Status.done,
      priority: Priority.high,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: ecommerceProject.id,
      title: "Implement authentication API",
      description: "Implement JWT authentication.",
      status: Status.in_progress,
      priority: Priority.urgent,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: ecommerceProject.id,
      title: "Create product API",
      description: "Create CRUD APIs for products.",
      status: Status.todo,
      priority: Priority.medium,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: ecommerceProject.id,
      title: "Implement payment integration",
      description: "Integrate payment gateway.",
      status: Status.review,
      priority: Priority.urgent,
    },
  });

  // --------------------------------------------------
  // Tasks - Project 2
  // --------------------------------------------------

  const task5 = await prisma.task.create({
    data: {
      projectId: mobileProject.id,
      title: "Create mobile navigation",
      status: Status.done,
      priority: Priority.medium,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      projectId: mobileProject.id,
      title: "Implement push notifications",
      status: Status.in_progress,
      priority: Priority.high,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      projectId: mobileProject.id,
      title: "Create profile screen",
      status: Status.todo,
      priority: Priority.low,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      projectId: mobileProject.id,
      title: "Add dark mode",
      status: Status.review,
      priority: Priority.low,
    },
  });

  // --------------------------------------------------
  // Tasks - Project 3 / Organization B
  // --------------------------------------------------

  const task9 = await prisma.task.create({
    data: {
      projectId: crmProject.id,
      title: "Create customer API",
      status: Status.in_progress,
      priority: Priority.high,
    },
  });

  const task10 = await prisma.task.create({
    data: {
      projectId: crmProject.id,
      title: "Create customer dashboard",
      status: Status.todo,
      priority: Priority.medium,
    },
  });

  const task11 = await prisma.task.create({
    data: {
      projectId: crmProject.id,
      title: "Implement CRM search",
      status: Status.review,
      priority: Priority.high,
    },
  });

  const task12 = await prisma.task.create({
    data: {
      projectId: crmProject.id,
      title: "Add CRM reports",
      status: Status.done,
      priority: Priority.low,
    },
  });

  // --------------------------------------------------
  // Assignments
  // --------------------------------------------------

  await prisma.taskAssignment.createMany({
    data: [
      {
        taskId: task1.id,
        userId: memberA1.id,
      },
      {
        taskId: task2.id,
        userId: memberA1.id,
      },
      {
        taskId: task3.id,
        userId: memberA2.id,
      },
      {
        taskId: task4.id,
        userId: adminA.id,
      },
      {
        taskId: task5.id,
        userId: memberA2.id,
      },
      {
        taskId: task6.id,
        userId: memberA1.id,
      },
      {
        taskId: task9.id,
        userId: memberB.id,
      },
      {
        taskId: task10.id,
        userId: adminB.id,
      },
    ],
  });

  // --------------------------------------------------
  // Comments
  // --------------------------------------------------

  await prisma.comment.createMany({
    data: [
      {
        taskId: task1.id,
        userId: memberA1.id,
        content: "Login page has been completed.",
      },
      {
        taskId: task2.id,
        userId: adminA.id,
        content: "JWT implementation is in progress.",
      },
      {
        taskId: task3.id,
        userId: memberA2.id,
        content: "Product API development started.",
      },
      {
        taskId: task4.id,
        userId: adminA.id,
        content: "Payment integration is ready for review.",
      },
      {
        taskId: task9.id,
        userId: memberB.id,
        content: "Customer API is almost completed.",
      },
    ],
  });

  console.log("✅ Database seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });