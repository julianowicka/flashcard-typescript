import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/lib/prisma";

const githubProvider = process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
    : null;

export const {handlers, auth, signIn, signOut} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: githubProvider ? [githubProvider] : [],
    session: {
        strategy: "database",
    },
    callbacks: {
        session({session, user}) {
            if (session.user) {
                session.user.id = user.id;
            }

            return session;
        },
    },
});
