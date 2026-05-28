import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../lib/prisma";
import { sendVerificationEmail } from "./email/email";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,


    },
    emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
      
    },
    sendOnSignUp: true,
  },
});