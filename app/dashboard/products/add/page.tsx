import { createProduct } from "@/app/actions/product.actions";
import styles from "../../../ui/dashboard/products/addProduct/addProduct.module.css";

const AddProductPage = () => {
  return (
    <div className={styles.container}>
      <form action={createProduct} className={styles.form}>
        <input type="text" placeholder="Name" name="name" required />
        <select name="category" id="category">
          <option value="default">Choose a category</option>
          <option value="tv">TV</option>
          <option value="phone">Phone</option>
          <option value="computer">Computer</option>
        </select>
        <input type="number" placeholder="Price" name="price" />
        <input type="number" placeholder="Stock" name="stock" />
        <input type="text" placeholder="Color" name="color" />
        <input type="text" placeholder="Size" name="size" />
        <textarea
          name="description"
          id="description"
          placeholder="Description"
          required
          rows={4}
        />
        <div className={styles.buttonWrapper}>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
