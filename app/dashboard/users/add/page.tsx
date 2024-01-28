import styles from "../../../ui/dashboard/users/addUser/addUser.module.css";

const addUserPage = () => {
  return (
    <div className={styles.container}>
      <form action="" className={styles.form}>
        <input type="text" placeholder="Username" name="ser" required />
        <input type="email" placeholder="Email" name="mail" required />
        <input
          type="password"
          placeholder="Password"
          name="password"
          required
        />
        <input type="phone" placeholder="Phone" name="phone" />
        <select name="isAdmin" id="isAdmin">
          <option value="false" selected>
            Is Admin?
          </option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <select name="isActive" id="isActive">
          <option value="true" selected>
            Is Active?
          </option>
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
