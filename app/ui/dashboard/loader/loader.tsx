import styles from './loader.module.css';

const Loader = () => {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <div className={styles.text}>Loading...</div>
    </div>
  );
};

export default Loader;
