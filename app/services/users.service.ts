import { connectToDB } from "../lib/utils";
import { User } from "../models/user";

const USERS_PER_PAGE = parseInt(process.env.USERS_PER_PAGE || "10");

export const getUsers = async (query: any, page: any) => {
  const regex = new RegExp(query, "i");
  const queryRegex = { username: { $regex: regex } };
  try {
    connectToDB();
    const countUsers = await User.countDocuments(queryRegex);
    const users = await User.find(queryRegex)
      .limit(USERS_PER_PAGE)
      .skip((page - 1) * USERS_PER_PAGE);
    const totalPages = Math.ceil(countUsers / USERS_PER_PAGE);
    return { totalPages, users };
  } catch (error) {
    throw new Error("Error getting users");
  }
};
