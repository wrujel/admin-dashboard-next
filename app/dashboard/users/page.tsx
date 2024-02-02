import Search from "@/app/ui/dashboard/search/search";
import styles from "../../ui/dashboard/users/users.module.css";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import { getUsers } from "@/app/services/users.service";
import { deleteUser } from "@/app/actions/user.actions";

const UsersPage = async ({ searchParams }: { searchParams: any }) => {
  const query = searchParams?.search || "";
  const page = searchParams?.page || "1";
  const { totalPages, users } = await getUsers(query, page);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a user" />
        <Link href="/dashboard/users/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Email</td>
            <td>Created at</td>
            <td>Role</td>
            <td>Status</td>
            <td>Action</td>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className={styles.userSection}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={user.img || "/images/avatar_placeholder.jpg"}
                      alt="avatar"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={styles.userImage}
                    />
                  </div>
                  {user.username}
                </div>
              </td>
              <td>{user.email}</td>
              <td>{new Date(user.createdAt).toDateString()}</td>
              <td>{user.isAdmin ? "Admin" : "User"}</td>
              <td>{user.isActive ? "Active" : "Inactive"}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={"/dashboard/users/" + user.id}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form action={deleteUser}>
                    <input type="hidden" value={user.id} name="id" />
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

export default UsersPage;
