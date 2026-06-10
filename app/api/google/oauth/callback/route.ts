import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleGoogleOAuthCallback } from "@/lib/googleDocs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const baseUrl = `${url.protocol}//${url.host}`;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/reports?google=error&message=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/reports?google=error&message=${encodeURIComponent("Thiếu mã xác thực Google OAuth.")}`);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("kolia_google_oauth_state")?.value;
  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${baseUrl}/reports?google=error&message=${encodeURIComponent("State OAuth không hợp lệ.")}`);
  }

  try {
    await handleGoogleOAuthCallback(code);
    const response = NextResponse.redirect(`${baseUrl}/reports?google=connected`);
    response.cookies.set("kolia_google_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/"
    });
    return response;
  } catch (errorValue) {
    const message = errorValue instanceof Error ? errorValue.message : "Không thể kết nối Google OAuth.";
    return NextResponse.redirect(`${baseUrl}/reports?google=error&message=${encodeURIComponent(message)}`);
  }
}
