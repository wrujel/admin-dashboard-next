import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import styles from "../../ui/dashboard/products/products.module.css";
import Image from "next/image";
import Pagination from "@/app/ui/dashboard/pagination/pagination";

const ProductsPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a user" />
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
          <tr>
            <td>
              <div className={styles.product}>
                <Image
                  src="/images/noimage_placeholder.png"
                  alt="avatar"
                  width={40}
                  height={40}
                  className={styles.productImage}
                />
                iPhone
              </div>
            </td>
            <td>Lorem ipsum dolor sit amet.</td>
            <td>$999.99</td>
            <td>28.01.24</td>
            <td>5</td>
            <td>
              <div className={styles.buttons}>
                <Link href="/dashboard/users/view">
                  <button className={`${styles.button} ${styles.view}`}>
                    View
                  </button>
                </Link>
                <button className={`${styles.button} ${styles.delete}`}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination />
    </div>
  );
};

export default ProductsPage;
