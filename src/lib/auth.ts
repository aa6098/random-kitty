import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../lib/prisma";
import { sendVerificationEmail, sendResetPasswordEmail } from "./email/email";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    
    }),
  trustedOrigins: [
    'https://vashikar.vercel.app',
    'https://www.random-kitty.com',
    'https://random-kitty.com',
    `https://${process.env.VERCEL_URL}` // Dynamically trusts Vercel preview domains
  ],

  
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
          await sendResetPasswordEmail(user.email, url);
        },
    },
    emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
      
    },
    sendOnSignUp: true,
  },
});