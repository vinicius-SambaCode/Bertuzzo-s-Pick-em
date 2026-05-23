import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Login",  type: "text" },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { username: (credentials.username as string).toLowerCase().trim() },
        })

        if (!user || !user.isActive) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id:        user.id,
          email:     user.email,
          name:      user.name,
          role:      user.role,
          avatarUrl: user.avatarUrl,
          username:  user.username,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id        = user.id
        token.role      = (user as any).role
        token.avatarUrl = (user as any).avatarUrl
        token.username  = (user as any).username
      }
      return token
    },
    session({ session, token }) {
      session.user.id        = token.id as string
      session.user.role      = token.role as string
      session.user.avatarUrl = (token.avatarUrl as string) ?? null
      ;(session.user as any).username = token.username
      return session
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
})
