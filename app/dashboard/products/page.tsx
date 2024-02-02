import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import styles from "../../ui/dashboard/products/products.module.css";
import Image from "next/image";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import { getProducts } from "@/app/services/products.service";
import { deleteProduct } from "@/app/actions/product.actions";

const ProductsPage = async ({ searchParams }: { searchParams: any }) => {
  const query = searchParams?.search || "";
  const page = searchParams?.page || "1";
  const { totalPages, products } = await getProducts(query, page);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a product" />
        <Link href="/dashboard/products/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Description</td>
            <td>Price</td>
            <td>Created at</td>
            <td>Stock</td>
            <td>Action</td>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className={styles.productSection}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={product.img || "/images/noimage_placeholder.png"}
                      alt="avatar"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={styles.productImage}
                    />
                  </div>
                  {product.name}
                </div>
              </td>
              <td>{product.description}</td>
              <td>
                <span className={styles.textRight}>${product.price}</span>
              </td>
              <td>{new Date(product.createdAt).toDateString()}</td>
              <td>
                <span className={styles.textRight}>{product.stock}</span>
              </td>
              <td>
                <div className={styles.buttons}>
                  <Link href="/dashboard/products/view">
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" value={product.id} name="id" />
                    <button className={`${styles.button} ${styles.delete}`}>
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination totalPages={totalPages} />
    </div>
  );
};

export default ProductsPage;
