"use client";

import Link from "next/link";
import styles from "./menuLink.module.css";
import { usePathname } from "next/navigation";

interface MenuLinkProps {
  title: string;
  path: string;
  icon: any;
}

const MenuLink = (item: MenuLinkProps) => {
  const pathName = usePathname();

  const isActive = () => {
    return item.path !== "" && pathName === item.path && styles.active;
  };

  const isDisabled = () => {
    return item.path === "" ? styles.disabled : styles.bgActive;
  };

  return (
    <Link
      href={item?.path || "#"}
      className={`${styles.container} ${isActive()} ${isDisabled()}`}
    >
      {item.icon}
      <span>{item.title}</span>
    </Link>
  );
};

export default MenuLink;
