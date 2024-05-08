import Image from "next/image";
import styles from "./floatcard.module.css";
import { MdPlayCircleFilled, MdReadMore } from "react-icons/md";

const FloatCard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.bgContainer}>
          <Image
            src="/images/rocket.png"
            alt="Rocket"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.bg}
          />
        </div>
        <div className={styles.texts}>
          <span className={styles.notification}>🔥 Available Now</span>
          <h3 className={styles.title}>How to use the new features</h3>
          <span className={styles.subtitle}>3 min read</span>
          <p className={styles.description}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit
            debitis maxime deserunt sed mollitia, minus nemo illo dolores
            suscipit tempore.
          </p>
          <button className={styles.button} disabled>
            <MdPlayCircleFilled />
            Watch
          </button>
        </div>
      </div>

      <div className={styles.item}>
        <div className={styles.texts}>
          <span className={styles.notification}>🚀 Comming Soon</span>
          <h3 className={styles.title}>New features are coming</h3>
          <span className={styles.subtitle}>2 min read</span>
          <p className={styles.description}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit
            debitis maxime deserunt sed mollitia, minus nemo illo dolores
            suscipit tempore.
          </p>
          <button className={styles.button} disabled>
            <MdReadMore />
            Learn
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatCard;
