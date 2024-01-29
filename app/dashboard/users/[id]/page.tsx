import Image from "next/image";
import styles from "../../../ui/dashboard/users/idUser/idUser.module.css";

const UserIdPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image src="/images/avatar_placeholder.jpg" alt="avatar" fill />
        </div>
        John Doe
      </div>
      <div className={styles.formContainer}>
        <form action="" className={styles.form}>
          <label>Username</label>
          <input type="text" name="username" placeholder="John Doe" />
          <label>Email</label>
          <input type="email" name="email" placeholder="john@gmail.com" />
          <label>Password</label>
          <input type="password" name="password" placeholder="******" />
          <label>Phone</label>
          <input type="text" name="phone" placeholder="+123456789" />
          <label>Address</label>
          <textarea name="address" placeholder="Palo Alto" />
          <label>Is Admin?</label>
          <select name="isAdmin" id="isAdmin">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <label>Is Active?</label>
          <select name="isActive" id="isActive">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <div className={styles.buttonWrapper}>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserIdPage;
