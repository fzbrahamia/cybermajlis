const mockCreateUser = jest.fn();
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockSetDoc = jest.fn();
const mockDoc = jest.fn();
const mockHash = jest.fn();

jest.mock("@/app/lib/firebase", () => ({ auth: {}, db: {} }));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUser(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

jest.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}));

jest.mock("bcryptjs", () => ({
  hash: (...args: unknown[]) => mockHash(...args),
}));

import { signUp, signIn, logOut } from "@/app/lib/auth";

const fakeUser = { uid: "uid123" };

describe("signUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateUser.mockResolvedValue({ user: fakeUser });
    mockHash.mockResolvedValue("hashed_password");
    mockSetDoc.mockResolvedValue(undefined);
    mockDoc.mockReturnValue("docRef");
  });

  it("returns success:true with user on valid credentials", async () => {
    const result = await signUp("a@b.com", "pass123", "Ali");
    expect(result.success).toBe(true);
    expect(result.user).toEqual(fakeUser);
  });

  it("calls createUserWithEmailAndPassword with email and password", async () => {
    await signUp("a@b.com", "pass123", "Ali");
    expect(mockCreateUser).toHaveBeenCalledWith({}, "a@b.com", "pass123");
  });

  it("hashes the password before storing", async () => {
    await signUp("a@b.com", "pass123", "Ali");
    expect(mockHash).toHaveBeenCalledWith("pass123", 10);
  });

  it("stores username, email, and hashed password in Firestore", async () => {
    await signUp("a@b.com", "pass123", "Ali");
    expect(mockSetDoc).toHaveBeenCalledWith(
      "docRef",
      expect.objectContaining({
        username: "Ali",
        email: "a@b.com",
        password: "hashed_password",
      })
    );
  });

  it("returns success:false with error message on failure", async () => {
    mockCreateUser.mockRejectedValue({ message: "Email already in use" });
    const result = await signUp("a@b.com", "pass123", "Ali");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Email already in use");
  });
});

describe("signIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns success:true with user on valid credentials", async () => {
    mockSignIn.mockResolvedValue({ user: fakeUser });
    const result = await signIn("a@b.com", "pass123");
    expect(result.success).toBe(true);
    expect(result.user).toEqual(fakeUser);
  });

  it("calls signInWithEmailAndPassword with correct args", async () => {
    mockSignIn.mockResolvedValue({ user: fakeUser });
    await signIn("a@b.com", "pass123");
    expect(mockSignIn).toHaveBeenCalledWith({}, "a@b.com", "pass123");
  });

  it("returns success:false with error message on wrong password", async () => {
    mockSignIn.mockRejectedValue({ message: "Wrong password" });
    const result = await signIn("a@b.com", "wrong");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Wrong password");
  });
});

describe("logOut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns success:true on successful sign-out", async () => {
    mockSignOut.mockResolvedValue(undefined);
    const result = await logOut();
    expect(result.success).toBe(true);
  });

  it("calls firebase signOut", async () => {
    mockSignOut.mockResolvedValue(undefined);
    await logOut();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("returns success:false with error message on failure", async () => {
    mockSignOut.mockRejectedValue({ message: "Network error" });
    const result = await logOut();
    expect(result.success).toBe(false);
    expect(result.error).toBe("Network error");
  });
});
