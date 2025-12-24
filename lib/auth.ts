import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { username } from "better-auth/plugins";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
  basePath: "/auth",
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  plugins: [username()],
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        return bcrypt.hashSync(password, 12);
      },
      verify: async ({
        hash,
        password,
      }: {
        hash: string;
        password: string;
      }) => {
        return bcrypt.compareSync(password, hash);
      },
    },
  },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
      image: "image",
      password: "password_hash", // Map to our DB column
    },
    additionalFields: {
      business_name: { type: "string", required: false },
      logo_url: { type: "string", required: false },
    },
  },
  // ... rest of config
  session: {
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      expiresAt: "expires_at",
      password: "password_hash",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
});
