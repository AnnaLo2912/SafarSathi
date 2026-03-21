import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import VerifiedGuide from "../models/VerifiedGuide.model.js";
import { normalizeName } from "../utils/verification.utils.js";

const seedData = [
  {
    enrollment_no: "IITF-2022-00451",
    full_name: "Rohit Sharma",
    status: "active",
    issued_year: 2022,
    source: "IITF",
  },
  {
    enrollment_no: "IITF-2023-00892",
    full_name: "Priya Nair",
    status: "active",
    issued_year: 2023,
    source: "IITF",
  },
  {
    enrollment_no: "IITF-2021-00177",
    full_name: "Aman Verma",
    status: "active",
    issued_year: 2021,
    source: "IITF",
  },
  {
    enrollment_no: "IITF-2020-00073",
    full_name: "Sneha Kulkarni",
    status: "suspended",
    issued_year: 2020,
    source: "IITF",
  },
  {
    enrollment_no: "IITF-2024-01024",
    full_name: "Karthik Iyer",
    status: "active",
    issued_year: 2024,
    source: "IITF",
  },


];

async function run() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected. Check MONGO_URI in backend/.env");
  }

  const docs = seedData.map((row) => ({
    ...row,
    normalized_name: normalizeName(row.full_name),
  }));

  const bulkOps = docs.map((doc) => ({
    updateOne: {
      filter: { enrollment_no: doc.enrollment_no },
      update: { $set: doc },
      upsert: true,
    },
  }));

  await VerifiedGuide.bulkWrite(bulkOps, { ordered: false });

  const seeded = await VerifiedGuide.find({ enrollment_no: { $in: docs.map((d) => d.enrollment_no) } })
    .sort({ enrollment_no: 1 })
    .lean();

  console.log("Seeded verified guides:");
  seeded.forEach((guide) => {
    console.log(`- ${guide.enrollment_no} | ${guide.full_name} | ${guide.status} | ${guide.source}`);
  });

  await mongoose.connection.close();
}

run().catch(async (error) => {
  console.error("Seeding failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
