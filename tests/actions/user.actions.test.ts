import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createUser, deleteUser, updateUser } from "@/app/actions/user.actions";
import { initialActionState } from "@/app/actions/action-state";

// Hoisted: vi.mock factories are lifted above module-level consts, and this
// file imports the action module statically.
const { revalidatePath, connectToDB, requireUser, hash, User } = vi.hoisted(
  () => ({
    revalidatePath: vi.fn(),
    connectToDB: vi.fn(),
    requireUser: vi.fn(),
    hash: vi.fn(),
    User: {
      create: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    },
  }),
);

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/app/lib/utils", () => ({ connectToDB }));
vi.mock("@/app/models/user", () => ({ User }));
vi.mock("@/app/lib/auth/dal", () => ({ requireUser }));
vi.mock("bcrypt", () => ({ default: { hash } }));

/** Builds a FormData with valid defaults, overridable per field. */
function form(over: Record<string, string> = {}) {
  const data = new FormData();
  const fields = {
    username: "adalovelace",
    email: "ada@example.com",
    password: "correct-horse",
    phone: "555-0100",
    address: "1 Analytical Way",
    isAdmin: "false",
    isActive: "true",
    ...over,
  };
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireUser.mockResolvedValue({ id: "admin", role: "admin" });
  hash.mockImplementation(async (value: string) => `hashed:${value}`);
});

afterEach(() => {
  delete process.env.MONGO_URI;
});

const withDb = () => {
  process.env.MONGO_URI = "mongodb://localhost/nexus";
};

/* -------------------------------------------------------------------------- */

describe("createUser — authorisation", () => {
  it("requires a signed-in user before doing anything", async () => {
    await createUser(initialActionState, form());
    expect(requireUser).toHaveBeenCalled();
  });

  it("does not write when the session check rejects", async () => {
    withDb();
    requireUser.mockRejectedValue(new Error("NEXT_REDIRECT:/login"));
    await expect(createUser(initialActionState, form())).rejects.toThrow();
    expect(User.create).not.toHaveBeenCalled();
  });
});

describe("createUser — validation", () => {
  it("rejects a username shorter than three characters", async () => {
    const result = await createUser(
      initialActionState,
      form({ username: "ab" }),
    );
    expect(result).toEqual({
      status: "error",
      message: "Username must be at least 3 characters.",
    });
  });

  it("trims whitespace before measuring the username", async () => {
    const result = await createUser(
      initialActionState,
      form({ username: "  a  " }),
    );
    expect(result.status).toBe("error");
  });

  it.each(["", "no-at-sign", "a@b", "a@@b.com", "spaces @b.com"])(
    "rejects the invalid email %j",
    async (email) => {
      const result = await createUser(initialActionState, form({ email }));
      expect(result).toEqual({
        status: "error",
        message: "Enter a valid email address.",
      });
    },
  );

  it("rejects a password shorter than six characters", async () => {
    const result = await createUser(
      initialActionState,
      form({ password: "12345" }),
    );
    expect(result).toEqual({
      status: "error",
      message: "Password must be at least 6 characters.",
    });
  });

  it("treats missing fields as empty rather than throwing", async () => {
    const result = await createUser(initialActionState, new FormData());
    expect(result).toEqual({
      status: "error",
      message: "Username must be at least 3 characters.",
    });
  });
});

describe("createUser — demo mode", () => {
  it("reports success without touching the database", async () => {
    const result = await createUser(initialActionState, form());
    expect(result).toEqual({
      status: "success",
      message: "Invited in demo mode — connect a database to persist.",
    });
    expect(User.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("createUser — persisted", () => {
  beforeEach(withDb);

  it("hashes the password and stores the parsed fields", async () => {
    const result = await createUser(
      initialActionState,
      form({ isAdmin: "true", isActive: "false" }),
    );

    expect(hash).toHaveBeenCalledWith("correct-horse", 10);
    expect(User.create).toHaveBeenCalledWith({
      username: "adalovelace",
      email: "ada@example.com",
      passwordHash: "hashed:correct-horse",
      phone: "555-0100",
      address: "1 Analytical Way",
      isAdmin: true,
      isActive: false,
    });
    expect(result).toEqual({ status: "success", message: "User created." });
  });

  it("persists only the hash — no plaintext password field", async () => {
    hash.mockResolvedValue("$2b$10$opaque");
    await createUser(initialActionState, form());

    const [doc] = User.create.mock.calls[0];
    expect(doc).not.toHaveProperty("password");
    expect(doc.passwordHash).toBe("$2b$10$opaque");
    expect(Object.values(doc)).not.toContain("correct-horse");
  });

  it("revalidates the users list on success", async () => {
    await createUser(initialActionState, form());
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/users");
  });

  it("reports a generic error when the write fails", async () => {
    User.create.mockRejectedValue(new Error("E11000 duplicate key"));
    const result = await createUser(initialActionState, form());

    expect(result).toEqual({
      status: "error",
      message: "Could not create user.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("reports a generic error when hashing fails", async () => {
    hash.mockRejectedValue(new Error("bcrypt unavailable"));
    const result = await createUser(initialActionState, form());
    expect(result.status).toBe("error");
  });
});

/* -------------------------------------------------------------------------- */

describe("updateUser", () => {
  it("requires a signed-in user", async () => {
    await updateUser(initialActionState, form({ id: "u1" }));
    expect(requireUser).toHaveBeenCalled();
  });

  it("does not require a password", async () => {
    const result = await updateUser(
      initialActionState,
      form({ id: "u1", password: "" }),
    );
    expect(result.status).toBe("success");
  });

  it("still validates the username and email", async () => {
    await expect(
      updateUser(initialActionState, form({ username: "x" })),
    ).resolves.toMatchObject({ status: "error" });
    await expect(
      updateUser(initialActionState, form({ email: "nope" })),
    ).resolves.toMatchObject({ status: "error" });
  });

  it("reports demo mode without touching the database", async () => {
    const result = await updateUser(initialActionState, form({ id: "u1" }));
    expect(result).toEqual({
      status: "success",
      message: "Updated in demo mode.",
    });
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  describe("persisted", () => {
    beforeEach(withDb);

    it("updates the profile fields without a password", async () => {
      const result = await updateUser(
        initialActionState,
        form({ id: "u1", password: "" }),
      );

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith("u1", {
        username: "adalovelace",
        email: "ada@example.com",
        phone: "555-0100",
        address: "1 Analytical Way",
        isAdmin: false,
        isActive: true,
      });
      expect(hash).not.toHaveBeenCalled();
      expect(result).toEqual({ status: "success", message: "User updated." });
    });

    it("re-hashes the password when a new one is supplied", async () => {
      await updateUser(
        initialActionState,
        form({ id: "u1", password: "new-passphrase" }),
      );

      expect(hash).toHaveBeenCalledWith("new-passphrase", 10);
      const [, update] = User.findByIdAndUpdate.mock.calls[0];
      expect(update.passwordHash).toBe("hashed:new-passphrase");
    });

    it("defaults a missing id to an empty string rather than throwing", async () => {
      await updateUser(initialActionState, form({ password: "" }));
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "",
        expect.any(Object),
      );
    });

    it("revalidates the users list on success", async () => {
      await updateUser(initialActionState, form({ id: "u1", password: "" }));
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/users");
    });

    it("reports a generic error when the write fails", async () => {
      User.findByIdAndUpdate.mockRejectedValue(new Error("write conflict"));
      const result = await updateUser(
        initialActionState,
        form({ id: "u1", password: "" }),
      );
      expect(result).toEqual({
        status: "error",
        message: "Could not update user.",
      });
    });
  });
});

/* -------------------------------------------------------------------------- */

describe("deleteUser", () => {
  it("requires a signed-in user", async () => {
    await deleteUser("u1");
    expect(requireUser).toHaveBeenCalled();
  });

  it("reports demo mode without touching the database", async () => {
    const result = await deleteUser("u1");
    expect(result).toEqual({
      status: "success",
      message: "Removed (demo mode).",
    });
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  describe("persisted", () => {
    beforeEach(withDb);

    it("deletes the document and revalidates", async () => {
      const result = await deleteUser("u1");
      expect(connectToDB).toHaveBeenCalled();
      expect(User.findByIdAndDelete).toHaveBeenCalledWith("u1");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/users");
      expect(result).toEqual({ status: "success", message: "User deleted." });
    });

    it("reports a generic error when the delete fails", async () => {
      User.findByIdAndDelete.mockRejectedValue(new Error("not found"));
      const result = await deleteUser("u1");
      expect(result).toEqual({
        status: "error",
        message: "Could not delete user.",
      });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
