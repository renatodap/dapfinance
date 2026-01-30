import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthCookieConfig } from "@/lib/auth";

const LoginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = LoginSchema.parse(body);

    if (password !== process.env.APP_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const cookieConfig = getAuthCookieConfig();
    const response = NextResponse.json({ data: { authenticated: true } });
    response.headers.set(
      "Set-Cookie",
      `${cookieConfig.name}=${cookieConfig.value}; Path=${cookieConfig.path}; HttpOnly; SameSite=${cookieConfig.sameSite}; Max-Age=${cookieConfig.maxAge}${cookieConfig.secure ? "; Secure" : ""}`
    );
    return response;
  } catch (error) {
    console.error("[api/auth] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieConfig = getAuthCookieConfig();
    const cookie = request.cookies.get(cookieConfig.name);
    const authenticated = cookie?.value === cookieConfig.value;
    return NextResponse.json({ data: { authenticated } });
  } catch (error) {
    console.error("[api/auth] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
