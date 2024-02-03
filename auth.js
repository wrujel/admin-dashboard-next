import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./authconfig";
import { connectToDB } from "./app/lib/utils";
import { User } from "./app/models/user";
import bcrypt from "bcrypt";

const login = async (credentials) => {
  try {
    connectToDB();
    const user = await User.findOne({ username: credentials.username });
    if (!user) throw new Error("User not found");

    const passwordMatch = await bcrypt.compare(
      credentials.password,
      user.passwordHash
    );
    if (!passwordMatch) throw new Error("Password does not match");

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const { signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await login(credentials);
        if (user) return user;
        else return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
