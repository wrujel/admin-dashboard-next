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

  return (
    <Link
      href={item.path}
      className={`${styles.container} ${
        pathName === item.path && styles.active
      }`}
    >
      {item.icon}
      <span>{item.title}</span>
    </Link>
  );
};

export default MenuLink;
