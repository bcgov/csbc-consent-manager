import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { status: 404, message: "Not found" },
    { headers: { "Content-Type": "application/json" } },
  );
}
