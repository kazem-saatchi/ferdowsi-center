import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check if any admin already exists
    const existingAdmin = await prisma.person.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "An admin already exists" },
        { status: 400 }
      );
    }

    // Parse request body
    const adminId = process.env.ADMIN_ID;
    const adminPass = process.env.ADMIN_PASS;

    // Validate input
    if (!adminId || !adminPass) {
      return NextResponse.json(
        { error: "ADMIN_ID and ADMIN_PASS are required" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPass, 12);

    // Create admin user
    const admin = await prisma.person.create({
      data: {
        IdNumber: adminId,
        password: hashedPassword,
        role: "ADMIN",
        firstName: "ADMIN",
        lastName: "ADMIN",
        phoneOne: "0000000000",
        visable: false,
      },
    });

    // Return success (without sensitive data)
    return NextResponse.json({
      success: true,
      message: "First admin created successfully",
      user: {
        id: admin.id,
        username: admin.IdNumber,
        name: `${admin.firstName} ${admin.lastName}`,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
