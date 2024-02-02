import Image from "next/image";
import styles from "../../../ui/dashboard/products/idProduct/idProduct.module.css";
import { getProduct } from "@/app/services/products.service";
import { updateProduct } from "@/app/actions/product.actions";

const ProductIdPage = async ({ params }: { params: any }) => {
  const { id } = params;
  const product = await getProduct(id);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image
            src={product.img || "/images/noimage_placeholder.png"}
            alt="avatar"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.productImg}
          />
        </div>
        {product.name}
      </div>
      <div className={styles.formContainer}>
        <form action={updateProduct} className={styles.form}>
          <input
            type="text"
            placeholder="Name"
            name="name"
            defaultValue={product.name}
            required
          />
          <select name="category" id="category">
            <option value="phone">Phone</option>
            <option value="tv">TV</option>
            <option value="computer">Computer</option>
          </select>
          <input
            type="text"
            placeholder="Price"
            name="price"
            defaultValue={product.price}
          />
          <input
            type="text"
            placeholder="Stock"
            name="stock"
            defaultValue={product.stock}
          />
          <input
            type="text"
            placeholder="Color"
            name="color"
            defaultValue={product.color}
          />
          <input
            type="text"
            placeholder="Size"
            name="size"
            defaultValue={product.size}
          />
          <textarea
            name="description"
            id="description"
            placeholder="Description"
            rows={4}
            defaultValue={product.description}
          />
          <input type="hidden" name="id" value={product.id} />
          <div className={styles.buttonWrapper}>
            <button type="submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductIdPage;
