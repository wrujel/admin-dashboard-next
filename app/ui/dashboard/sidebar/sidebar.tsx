import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import { menuItems } from "./sidebar.data";
import styles from "./sidebar.module.css";
import { MdLogout } from "react-icons/md";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth.actions";
import { getUser } from "@/app/services/users.service";

const Sidebar = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const user = await getUser(session.user.id);

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Image
          src={(user.img ||= "/images/avatar_placeholder.jpg")}
          alt="profile image"
          width={50}
          height={50}
          className={styles.userImage}
        />
        <div className={styles.userDetail}>
          <span className={styles.username}>{(user.username ||= "Admin")}</span>
          <span className={styles.userTitle}>
            {user.isAdmin ? "Administrator" : "User"}
          </span>
        </div>
      </div>
      <ul className={styles.list}>
        {menuItems.map((category) => (
          <li key={category.id}>
            <span className={styles.category}>{category.title}</span>
            {category.list.map((item) => (
              <MenuLink key={item.title} {...item} />
            ))}
          </li>
        ))}
      </ul>
      <form action={logout}>
        <button className={styles.logout}>
          <MdLogout />
          Logout
        </button>
      </form>
    </div>
  );
};

export default Sidebar;
