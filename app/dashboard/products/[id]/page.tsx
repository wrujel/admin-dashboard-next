import Image from "next/image";
import styles from "../../../ui/dashboard/products/idProduct/idProduct.module.css";

const ProductIdPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image src="/images/noimage_placeholder.png" alt="avatar" fill />
        </div>
        Iphone
      </div>
      <div className={styles.formContainer}>
        <form action="" className={styles.form}>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value="iPhone"
            required
          />
          <select name="category" id="category">
            <option value="phone">Phone</option>
            <option value="tv">TV</option>
            <option value="computer">Computer</option>
          </select>
          <input
            type="number"
            placeholder="Price"
            name="price"
            value="999.99"
          />
          <input type="number" placeholder="Stock" name="stock" value={5} />
          <input
            type="text"
            placeholder="Color"
            name="color"
            value="Space Black"
          />
          <input type="text" placeholder="Size" name="size" value="Pro Max" />
          <textarea
            name="description"
            id="description"
            placeholder="Description"
            rows={4}
            value={
              "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum."
            }
          />
          <div className={styles.buttonWrapper}>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductIdPage;
