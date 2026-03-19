import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log("⚠️  No MONGO_URI — skipping DB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // timeout after 5 seconds
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // DON'T crash the app — just log and continue
    // process.exit(1)  ← this line was killing your server
  }
};

export default connectDB;


// import mongoose from "mongoose";

// const connectDB = async () => {
//   if (!process.env.MONGO_URI) {
//     console.log(" No MONGO_URI — skipping DB connection");
//     return;
//   }
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log(" MongoDB connected");
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// };

// export default connectDB;
// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// };

// export default connectDB;