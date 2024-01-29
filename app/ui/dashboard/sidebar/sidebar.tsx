import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import { menuItems } from "./sidebar.data";
import styles from "./sidebar.module.css";
import { MdLogout } from "react-icons/md";

const Sidebar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Image
          src="/images/avatar_placeholder.jpg"
          alt="profile image"
          width={50}
          height={50}
          className={styles.userImage}
        />
        <div className={styles.userDetail}>
          <span className={styles.username}>John Doe</span>
          <span className={styles.userTitle}>Administrator</span>
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
      <button className={styles.logout}>
        <MdLogout />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
