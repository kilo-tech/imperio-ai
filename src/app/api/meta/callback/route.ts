import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code received" });
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
  );
}