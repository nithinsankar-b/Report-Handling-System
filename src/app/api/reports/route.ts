import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Report } from './types';

const prisma = new PrismaClient();

// 📌 GET: Fetch all reports
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      include: {
        submitter: true,
        resolver: true,
      },
    });

    // Serialize BigInt values to strings for JSON compatibility
    const serializedReports = reports.map((report: Report) => ({
      ...report,
      id: report.id.toString(),
      target_id: report.target_id.toString(),
      submitted_by: report.submitted_by ? report.submitted_by.toString() : null,
      resolved_by: report.resolved_by ? report.resolved_by.toString() : null,
      submitter: report.submitter ? {
        ...report.submitter,
        id: report.submitter.id.toString()
      } : null,
      resolver: report.resolver ? {
        ...report.resolver,
        id: report.resolver.id.toString()
      } : null
    }));

    return NextResponse.json({ success: true, data: serializedReports });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    await prisma.$disconnect();
  }
}

// 📌 POST: Create a new report
export async function POST(req: Request) {
  try {
    const { type, target_id, reason, description, submitted_by } = await req.json();

    if (!type || !target_id || !reason || !submitted_by) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newReport = await prisma.report.create({
      data: { type, target_id, reason, description, submitted_by },
    });

    // Serialize BigInt values to strings
    const serializedReport = {
      ...newReport,
      id: newReport.id.toString(),
      target_id: newReport.target_id.toString(),
      submitted_by: newReport.submitted_by ? newReport.submitted_by.toString() : null,
      resolved_by: newReport.resolved_by ? newReport.resolved_by.toString() : null,
    };

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
