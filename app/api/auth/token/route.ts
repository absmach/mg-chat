import { Get } from "@/lib/token";
import type { NextRequest } from "next/server";

// Remove _resp: NextResponse parameter since it's not needed
export async function GET(req: NextRequest) {
  return await Get(req);
}
