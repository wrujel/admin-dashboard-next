"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import styles from "./pagination.module.css";

const Pagination = ({ totalPages }: { totalPages: number }) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const params = new URLSearchParams(searchParams);
  const { replace } = useRouter();

  const page = params.get("page") || "1";
  const hasPrev = parseInt(page) > 1;
  const hasNext = parseInt(page) <= totalPages;

  const handlePrev = () => {
    params.set("page", (parseInt(page) - 1).toString());
    replace(`${pathName}?${params.toString()}`);
  };

  const handleNext = () => {
    params.set("page", (parseInt(page) + 1).toString());
    replace(`${pathName}?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        disabled={!hasPrev}
        onClick={handlePrev}
      >
        Previous
      </button>
      <button
        className={styles.button}
        disabled={!hasNext}
        onClick={handleNext}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
