import { authenticate } from "@/app/actions/auth.actions";
import styles from "./loginForm.module.css";

const LoginForm = () => {
  return (
    <form action={authenticate} className={styles.form}>
      <h1 className={styles.title}>Login</h1>
      <input type="text" placeholder="Username" name="username" />
      <input type="password" placeholder="Password" name="password" />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
