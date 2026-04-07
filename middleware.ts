import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function sanitizeRedirectPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof supabaseResponse.cookies.set>[2];
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = ["/products", "/generator", "/saved", "/editor"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    redirectUrl.searchParams.set("redirectedFrom", requestedPath);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const nextParam = request.nextUrl.searchParams.get("next");
    const redirectedFromParam = request.nextUrl.searchParams.get("redirectedFrom");
    const targetPath =
      sanitizeRedirectPath(nextParam) ??
      sanitizeRedirectPath(redirectedFromParam) ??
      "/products";
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
