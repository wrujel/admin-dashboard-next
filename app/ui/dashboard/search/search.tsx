"use client";

import { MdSearch } from "react-icons/md";
import styles from "./search.module.css";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

const Search = ({ placeholder }: { placeholder: string }) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const params = new URLSearchParams(searchParams);
  const { replace } = useRouter();

  const searchDebounced = useDebouncedCallback((search) => {
    params.set("search", search);
    replace(`${pathName}?${params.toString()}`);
  }, 400);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.length > 0) searchDebounced(query);
    else {
      searchDebounced.cancel();
      params.delete("search");
      replace(`${pathName}?${params.toString()}`);
    }
  };

  return (
    <div className={styles.container}>
      <MdSearch />
      <input
        type="text"
        placeholder={placeholder}
        className={styles.input}
        onChange={handleSearch}
      />
    </div>
  );
};

export default Search;
