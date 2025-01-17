import db from "@/server/db";
import { incidents } from "@/server/db/schema";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  try {
    const count = await db.$count(incidents);
    return NextResponse.json({ status: "ok", incidents: count });
  } catch (error) {
    console.error("Healtcheck error", error);
    return NextResponse.json(
      { status: "An error ocurred connecting to the database" },
      { status: 500 }
    );
  }
}
