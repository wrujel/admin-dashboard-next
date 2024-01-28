import styles from "../../../ui/dashboard/products/addProduct/addProduct.module.css";

const AddProductPage = () => {
  return (
    <div className={styles.container}>
      <form action="" className={styles.form}>
        <input type="text" placeholder="title" name="title" required />
        <select name="category" id="category">
          <option value="default">Choose a category</option>
          <option value="tv">TV</option>
          <option value="phone">Phone</option>
          <option value="computer">Computer</option>
        </select>
        <input type="number" placeholder="price" name="price" />
        <input type="number" placeholder="stock" name="stock" />
        <input type="text" placeholder="color" name="color" />
        <input type="text" placeholder="size" name="size" />
        <textarea
          name="description"
          id="description"
          placeholder="Description"
          rows={16}
        />
        <div className={styles.buttonWrapper}>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
