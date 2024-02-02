import Image from "next/image";
import styles from "../../../ui/dashboard/users/idUser/idUser.module.css";
import { getUser } from "@/app/services/users.service";
import { updateUser } from "@/app/actions/user.actions";

const UserIdPage = async ({ params }: { params: any }) => {
  const { id } = params;
  const user = await getUser(id);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image
            src={user.img || "/images/avatar_placeholder.jpg"}
            alt="avatar"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.userImage}
          />
        </div>
        {user.username}
      </div>
      <div className={styles.formContainer}>
        <form action={updateUser} className={styles.form}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            defaultValue={user.username}
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            defaultValue={user.email}
          />
          <label>Password</label>
          <input type="password" name="password" placeholder="Password" />
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            defaultValue={user.phone}
          />
          <label>Address</label>
          <textarea
            name="address"
            placeholder="Address"
            defaultValue={user.address}
          />
          <label>Is Admin?</label>
          <select name="isAdmin" id="isAdmin" defaultValue={user.isAdmin}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <label>Is Active?</label>
          <select name="isActive" id="isActive" defaultValue={user.isActive}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <input type="hidden" value={user.id} name="id" />
          <div className={styles.buttonWrapper}>
            <button type="submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserIdPage;
