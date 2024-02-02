import { createUser } from "@/app/actions/createUser";
import styles from "../../../ui/dashboard/users/addUser/addUser.module.css";

const addUserPage = () => {
  return (
    <div className={styles.container}>
      <form action={createUser} className={styles.form}>
        <input type="text" placeholder="Username" name="username" required />
        <input type="email" placeholder="Email" name="email" required />
        <input
          type="password"
          placeholder="Password"
          name="password"
          required
        />
        <input type="phone" placeholder="Phone" name="phone" />
        <select name="isAdmin" id="isAdmin">
          <option value="false">Is Admin?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <select name="isActive" id="isActive">
          <option value="true">Is Active?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <textarea name="address" id="address" placeholder="Address" rows={1} />
        <div className={styles.buttonWrapper}>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default addUserPage;
