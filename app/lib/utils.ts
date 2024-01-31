import mongoose from "mongoose";

const { MONGO_URI } = process.env;

export const connectToDB = async () => {
  try {
    if (mongoose.connections[0].readyState !== 1 && MONGO_URI) {
      await mongoose.connect(MONGO_URI);
    }
  } catch (error) {
    throw new Error("Error connecting to database");
  }
};
