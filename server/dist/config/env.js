import "dotenv/config";
const must = (k) => {
    const v = process.env[k];
    if (!v)
        throw new Error(`Missing env: ${k}`);
    return v;
};
export const env = {
    PORT: Number(process.env.PORT ?? 4000),
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    MONGODB_URI: must("MONGODB_URI"),
    MONGO_DB_NAME: process.env.MONGO_DB_NAME ?? "pmtool",
    CLERK_PUBLISHABLE_KEY: must("CLERK_PUBLISHABLE_KEY"),
    CLERK_SECRET_KEY: must("CLERK_SECRET_KEY"),
    CLERK_JWT_ISSUER: must("CLERK_JWT_ISSUER"),
};
//# sourceMappingURL=env.js.map