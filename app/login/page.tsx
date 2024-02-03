import { authenticate } from "../actions/auth.actions";
import styles from "../ui/login/login.module.css";

const LoginPage = () => {
  return (
    <div className={styles.container}>
      <form action={authenticate} className={styles.form}>
        <h1 className={styles.title}>Login</h1>
        <input type="text" placeholder="Username" name="username" />
        <input type="password" placeholder="Password" name="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
