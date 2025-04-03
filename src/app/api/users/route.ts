import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to serialize BigInt to string
/* eslint-disable @typescript-eslint/no-explicit-any */
const serializeBigInt = (obj: any): any => {
  if (typeof obj === "bigint") {
    return obj.toString(); // Convert BigInt to string
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeBigInt(item)); // Handle arrays
  }

  if (obj && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = serializeBigInt(obj[key]); // Recursively handle object properties
      return acc;
    }, {} as Record<string, any>);
  }

  return obj; // Return non-BigInt values as they are
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// 📌 GET: Fetch a single report by ID
export async function GET(req: NextRequest) {
  try {
    // Extract ID from the URL
    const urlParts = req.nextUrl.pathname.split('/');
    const id = urlParts[urlParts.length - 1]; // Assuming ID is the last part of the URL

    if (!id) {
      return NextResponse.json({ success: false, error: "Report ID is required" }, { status: 400 });
    }

    // Fetch report by ID
    const report = await prisma.report.findUnique({
      where: { id: BigInt(id) },
      include: { submitter: true, resolver: true },
    });

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    // Serialize BigInt fields in the report object
    const serializedReport = serializeBigInt(report);

    return NextResponse.json({ success: true, data: serializedReport });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    await prisma.$disconnect();
  }
}

// 📌 PATCH: Mark report as resolved
export async function PATCH(req: NextRequest) {
  try {
    // Extract ID from the URL
    const urlParts = req.nextUrl.pathname.split('/');
    const id = urlParts[urlParts.length - 1]; // Assuming ID is the last part of the URL

    if (!id) {
      return NextResponse.json({ success: false, error: "Report ID is required" }, { status: 400 });
    }

    const { resolved_by } = await req.json(); // Expect resolved_by to be a string

    const updatedReport = await prisma.report.update({
      where: { id: BigInt(id) },
      data: { resolved_by, resolved_at: new Date() },
    });

    // Serialize BigInt fields in the updated report object
    const serializedUpdatedReport = serializeBigInt(updatedReport);

    return NextResponse.json({ success: true, data: serializedUpdatedReport });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    await prisma.$disconnect();
  }
}

// 📌 DELETE: Remove a report
export async function DELETE(req: NextRequest) {
  try {
    // Extract ID from the URL
    const urlParts = req.nextUrl.pathname.split('/');
    const id = urlParts[urlParts.length - 1]; // Assuming ID is the last part of the URL

    if (!id) {
      return NextResponse.json({ success: false, error: "Report ID is required" }, { status: 400 });
    }

    await prisma.report.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    await prisma.$disconnect();
  }
}
