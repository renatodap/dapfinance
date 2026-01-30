import { cookies } from "next/headers";

const COOKIE_NAME = "dapfinance-auth";
const COOKIE_VALUE = "authenticated";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value === COOKIE_VALUE;
}

export function getAuthCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: COOKIE_VALUE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
