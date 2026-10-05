import mongoose from "mongoose";

function isLocalUri(uri) {
  return uri.includes("127.0.0.1") || uri.includes("localhost");
}

export async function connectDb() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hiacdi-tech-hub";
  if (!isLocalUri(uri) && process.env.ALLOW_REMOTE_MONGO !== "true") {
    throw new Error(
      "Remote MongoDB is blocked. Add ALLOW_REMOTE_MONGO=true to backend/.env to use MongoDB Atlas."
    );
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: isLocalUri(uri) ? 4000 : 15000,
    dbName: process.env.MONGO_DB_NAME || "hiacdi-tech-hub",
  });
  console.log(`MongoDB connected (${isLocalUri(uri) ? "local" : "Atlas"})`);
}
