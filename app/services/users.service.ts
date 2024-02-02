import { connectToDB } from "../lib/utils";
import { User } from "../models/user";

const USERS_PER_PAGE = parseInt(process.env.USERS_PER_PAGE || "10");

export const getUsers = async (query: any, page: any) => {
  const regex = new RegExp(query, "i");
  try {
    connectToDB();
    const countUsers = await User.countDocuments({
      username: { $regex: regex },
    });
    const users = await User.find({ username: { $regex: regex } })
      .limit(USERS_PER_PAGE)
      .skip((page - 1) * USERS_PER_PAGE);
    const totalPages = Math.ceil(countUsers / USERS_PER_PAGE);
    console.log(totalPages);

    return { totalPages, users };
  } catch (error) {
    throw new Error("Error getting users");
  }
};
