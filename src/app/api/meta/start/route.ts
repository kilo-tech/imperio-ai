import { NextResponse } from "next/server";

export async function GET() {

  const appId = process.env.META_APP_ID;
  const redirect = process.env.META_REDIRECT_URI;

  const url =
    `https://www.facebook.com/v18.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${redirect}` +
    `&scope=whatsapp_business_management,whatsapp_business_messaging` +
    `&response_type=code`;

  return NextResponse.redirect(url);
}