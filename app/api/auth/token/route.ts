import type { NextRequest } from "next/server";
import { Get } from "@/lib/token";

// Remove _resp: NextResponse parameter since it's not needed
export async function GET(req: NextRequest) {
  return await Get(req);
}
