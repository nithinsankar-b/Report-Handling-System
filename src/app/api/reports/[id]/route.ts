import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to serialize BigInt to string
/* eslint-disable @typescript-eslint/no-explicit-any */
const serializeBigInt = (obj: any): any => {
  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeBigInt(item));
  }

  if (obj && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = serializeBigInt(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }

  return obj;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// 📌 GET: Fetch a single report by ID
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop(); // Extract ID from URL path
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    // Ensure the ID is properly cast to BigInt
    const report = await prisma.report.findUnique({
      where: { id: BigInt(id) },
      include: { submitter: true, resolver: true },
    });

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeBigInt(report) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error occurred" });
  } finally {
    await prisma.$disconnect();
  }
}

// 📌 PATCH: Mark report as resolved
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop(); // Extract ID from URL path
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const { resolved_by } = await req.json();

    const updatedReport = await prisma.report.update({
      where: { id: BigInt(id) },
      data: { resolved_by, resolved_at: new Date() },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(updatedReport) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error occurred" });
  } finally {
    await prisma.$disconnect();
  }
}

// 📌 DELETE: Remove a report
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop(); // Extract ID from URL path
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await prisma.report.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error occurred" });
  } finally {
    await prisma.$disconnect();
  }
}
