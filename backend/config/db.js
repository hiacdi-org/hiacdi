import mongoose from "mongoose";

function isLocalUri(uri) {
  return uri.includes("127.0.0.1") || uri.includes("localhost");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDb({ retries = 3 } = {}) {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hiacdi-tech-hub";
  if (!isLocalUri(uri) && process.env.ALLOW_REMOTE_MONGO !== "true") {
    throw new Error(
      "Remote MongoDB is blocked. Add ALLOW_REMOTE_MONGO=true to backend/.env to use MongoDB Atlas."
    );
  }
  const options = {
    serverSelectionTimeoutMS: isLocalUri(uri) ? 4000 : 20000,
    dbName: process.env.MONGO_DB_NAME || "hiacdi-tech-hub",
    ...(isLocalUri(uri) ? {} : { family: 4 }),
  };
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(uri, options);
      console.log(`MongoDB connected (${isLocalUri(uri) ? "local" : "Atlas"})`);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) await delay(1000 * attempt);
    }
  }
  throw lastError;
}

export async function disconnectDb() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.connection.close(false);
}
