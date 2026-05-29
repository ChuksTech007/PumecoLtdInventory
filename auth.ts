import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.role     = (user as any).role
        token.branch_id = (user as any).branch_id
        token.is_active = (user as any).is_active
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id        = token.id as string
        session.user.role      = token.role as string
        session.user.branch_id = token.branch_id as string
        session.user.is_active = token.is_active as boolean
      }
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }
        if (!email || !password) return null

        await connectDB()
        const user = await UserModel.findOne({ email: email.toLowerCase() }).lean()
        if (!user || !(user as any).is_active) return null

        const valid = await bcrypt.compare(password, (user as any).password)
        if (!valid) return null

        return {
          id:        (user as any)._id.toString(),
          name:      (user as any).name,
          email:     (user as any).email,
          role:      (user as any).role,
          branch_id: (user as any).branch_id?.toString(),
          is_active: (user as any).is_active,
        }
      },
    }),
  ],
})
