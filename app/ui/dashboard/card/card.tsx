import { MdSupervisedUserCircle } from "react-icons/md";
import styles from "./card.module.css";

const Card = () => {
  return (
    <div className={styles.container}>
      <MdSupervisedUserCircle size={20} />
      <div className={styles.info}>
        <span className={styles.title}>Total Users</span>
        <span className={styles.number}>99.999</span>
        <span className={styles.detail}>
          <span className={styles.positive}>12%</span> since last month
        </span>
      </div>
    </div>
  );
};

export default Card;
