import { connectToDB } from "../lib/utils";
import { Product } from "../models/product";

const PRODUCTS_PER_PAGE = parseInt(process.env.PRODUCTS_PER_PAGE || "10");

export const getProducts = async (query: any, page: any) => {
  const regex = new RegExp(query, "i");
  const queryRegex = { name: { $regex: regex } };
  try {
    connectToDB();
    const countProducts = await Product.countDocuments(queryRegex);
    const products = await Product.find(queryRegex)
      .limit(PRODUCTS_PER_PAGE)
      .skip((page - 1) * PRODUCTS_PER_PAGE);
    const totalPages = Math.ceil(countProducts / PRODUCTS_PER_PAGE);
    console.log(totalPages);

    return { totalPages, products };
  } catch (error) {
    throw new Error("Error getting users");
  }
};
