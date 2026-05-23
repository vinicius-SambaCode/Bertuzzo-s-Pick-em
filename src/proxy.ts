import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth
  const isPublic = ["/login", "/register"].some((p) => nextUrl.pathname.startsWith(p))

  if (!isAuthenticated && !isPublic) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  const role = req.auth?.user?.role

  if (nextUrl.pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (nextUrl.pathname.startsWith("/dashboard/fiscal") && role !== "FISCAL" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Exclui: API routes, assets Next.js, arquivos estáticos (images, icons, uploads, favicon)
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.png|images|icons|uploads|manifest\\.json).*)"],
}
