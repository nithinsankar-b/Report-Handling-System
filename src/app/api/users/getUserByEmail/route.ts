import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 GET: Fetch user by email
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);  // Get URL search params
  const email = searchParams.get("email");  // Extract the email parameter

  if (!email) {
    return NextResponse.json({
      success: false,
      error: "Email parameter is required",
    }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      }, { status: 404 });
    }

    // Convert BigInt to string for serialization
    return NextResponse.json({
      success: true,
      data: {
        ...user,
        id: user.id.toString(),  // Convert BigInt to string
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    await prisma.$disconnect();
  }
}
