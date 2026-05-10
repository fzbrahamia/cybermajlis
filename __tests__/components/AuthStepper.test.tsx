import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import StepperFlow from "@/components/AuthStepper";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

jest.mock("framer-motion", () => ({
  motion: { div: ({ children }: { children: React.ReactNode }) => <div>{children}</div> },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/app/lib/firebase", () => ({ auth: {}, db: {} }));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock("bcryptjs", () => ({ hash: jest.fn().mockResolvedValue("hashed") }));

jest.mock("@/components/CharacterSelection", () => ({
  __esModule: true,
  default: ({ onSelect }: { onSelect: (v: string) => void }) => (
    <button onClick={() => onSelect("oryx")}>select_character</button>
  ),
}));

jest.mock("@/components/Modal", () => ({
  __esModule: true,
  default: () => null,
}));

// ── helpers ──────────────────────────────────────────────────

const enterSignUp = () => fireEvent.click(screen.getByText("login.footer_link"));

const fillStep1 = (email: string, username: string) => {
  fireEvent.change(screen.getByPlaceholderText("signup.email_placeholder"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("signup.username_placeholder"), {
    target: { value: username },
  });
};

const continueBtn = () =>
  screen.getAllByRole("button").find(b => b.textContent?.includes("continue_btn"))!;

// ── Login view (default) ─────────────────────────────────────

describe("StepperFlow — login view", () => {
  it("renders the login form by default", () => {
    render(<StepperFlow />);
    expect(screen.getByPlaceholderText("login.email_placeholder")).toBeInTheDocument();
  });

  it("switches to signup when footer link is clicked", () => {
    render(<StepperFlow />);
    enterSignUp();
    expect(screen.getByPlaceholderText("signup.email_placeholder")).toBeInTheDocument();
  });
});

// ── Step 1: Email & username validation ──────────────────────

describe("StepperFlow — step 1 validation", () => {
  beforeEach(() => {
    render(<StepperFlow />);
    enterSignUp();
  });

  it("continue button is disabled when fields are empty", () => {
    expect(continueBtn()).toBeDisabled();
  });

  it("continue button is disabled with invalid email format", () => {
    fillStep1("not-an-email", "Ali");
    expect(continueBtn()).toBeDisabled();
  });

  it("continue button is disabled when username is shorter than 3 chars", () => {
    fillStep1("ali@test.com", "Al");
    expect(continueBtn()).toBeDisabled();
  });

  it("continue button is enabled with valid email and username", () => {
    fillStep1("ali@test.com", "Ali");
    expect(continueBtn()).not.toBeDisabled();
  });

  it("shows email error when email is invalid", () => {
    fireEvent.change(screen.getByPlaceholderText("signup.email_placeholder"), {
      target: { value: "bad-email" },
    });
    expect(screen.getByText("signup.errors.invalid_email")).toBeInTheDocument();
  });

  it("shows username error when username is too short", () => {
    fireEvent.change(screen.getByPlaceholderText("signup.username_placeholder"), {
      target: { value: "Al" },
    });
    expect(screen.getByText("signup.errors.username_short")).toBeInTheDocument();
  });

  it("does not show email error when email is valid", () => {
    fillStep1("ali@test.com", "Ali");
    expect(screen.queryByText("signup.errors.invalid_email")).not.toBeInTheDocument();
  });
});

// ── Step 2: Password validation ──────────────────────────────

describe("StepperFlow — step 2 password validation", () => {
  beforeEach(() => {
    render(<StepperFlow />);
    enterSignUp();
    fillStep1("ali@test.com", "Ali");
    fireEvent.click(continueBtn());
  });

  const passwordInput = () =>
    screen.getByPlaceholderText("signup.password_placeholder");

  const confirmInput = () =>
    screen.getByPlaceholderText("signup.confirm_placeholder");

  it("password checks appear when typing starts", () => {
    fireEvent.change(passwordInput(), { target: { value: "a" } });
    expect(screen.getByText(/pw_checks\.length/)).toBeInTheDocument();
    expect(screen.getByText(/pw_checks\.number/)).toBeInTheDocument();
    expect(screen.getByText(/pw_checks\.upper/)).toBeInTheDocument();
    expect(screen.getByText(/pw_checks\.symbol/)).toBeInTheDocument();
  });

  it("length check passes when password has 8+ characters", () => {
    fireEvent.change(passwordInput(), { target: { value: "abcdefgh" } });
    const lengthItem = screen.getByText(/pw_checks\.length/).closest("li");
    expect(lengthItem).toHaveClass("valid");
  });

  it("number check passes when password contains a digit", () => {
    fireEvent.change(passwordInput(), { target: { value: "abcd1234" } });
    const numberItem = screen.getByText(/pw_checks\.number/).closest("li");
    expect(numberItem).toHaveClass("valid");
  });

  it("upper check passes when password contains an uppercase letter", () => {
    fireEvent.change(passwordInput(), { target: { value: "abcdEfgh" } });
    const upperItem = screen.getByText(/pw_checks\.upper/).closest("li");
    expect(upperItem).toHaveClass("valid");
  });

  it("symbol check passes when password contains a special character", () => {
    fireEvent.change(passwordInput(), { target: { value: "abcd@efg" } });
    const symbolItem = screen.getByText(/pw_checks\.symbol/).closest("li");
    expect(symbolItem).toHaveClass("valid");
  });

  it("continue button disabled when password fails checks", () => {
    fireEvent.change(passwordInput(), { target: { value: "weak" } });
    expect(continueBtn()).toBeDisabled();
  });

  it("shows mismatch error when confirm password differs", () => {
    fireEvent.change(passwordInput(), { target: { value: "Secure@123" } });
    fireEvent.change(confirmInput(), { target: { value: "Different@1" } });
    expect(screen.getByText("signup.errors.passwords_no_match")).toBeInTheDocument();
  });

  it("continue button disabled when passwords do not match", () => {
    fireEvent.change(passwordInput(), { target: { value: "Secure@123" } });
    fireEvent.change(confirmInput(), { target: { value: "Different@1" } });
    expect(continueBtn()).toBeDisabled();
  });

  it("continue button enabled when all checks pass and passwords match", () => {
    fireEvent.change(passwordInput(), { target: { value: "Secure@123" } });
    fireEvent.change(confirmInput(), { target: { value: "Secure@123" } });
    expect(continueBtn()).not.toBeDisabled();
  });
});

// ── Step 3: Character selection ──────────────────────────────

describe("StepperFlow — step 3 character selection", () => {
  const completeBtn = () =>
    screen.getAllByRole("button").find(b => b.textContent?.includes("complete_btn"))!;

  beforeEach(() => {
    render(<StepperFlow />);
    enterSignUp();
    fillStep1("ali@test.com", "Ali");
    fireEvent.click(continueBtn());
    const passwordInput = screen.getByPlaceholderText("signup.password_placeholder");
    const confirmInput = screen.getByPlaceholderText("signup.confirm_placeholder");
    fireEvent.change(passwordInput, { target: { value: "Secure@123" } });
    fireEvent.change(confirmInput, { target: { value: "Secure@123" } });
    fireEvent.click(continueBtn());
  });

  it("renders the character selection step", () => {
    expect(screen.getByText("select_character")).toBeInTheDocument();
  });

  it("complete button is disabled before selecting a character", () => {
    expect(completeBtn()).toBeDisabled();
  });

  it("complete button is enabled after selecting a character", () => {
    fireEvent.click(screen.getByText("select_character"));
    expect(completeBtn()).not.toBeDisabled();
  });
});

// ── Step navigation ──────────────────────────────────────────

describe("StepperFlow — step navigation", () => {
  beforeEach(() => {
    render(<StepperFlow />);
    enterSignUp();
  });

  it("back button is not shown on step 1", () => {
    expect(screen.queryByText(/back_btn/)).not.toBeInTheDocument();
  });

  it("back button appears on step 2", () => {
    fillStep1("ali@test.com", "Ali");
    fireEvent.click(continueBtn());
    expect(screen.getByText(/back_btn/)).toBeInTheDocument();
  });

  it("clicking back on step 2 returns to step 1", () => {
    fillStep1("ali@test.com", "Ali");
    fireEvent.click(continueBtn());
    fireEvent.click(screen.getByText(/back_btn/));
    expect(screen.getByPlaceholderText("signup.email_placeholder")).toBeInTheDocument();
  });
});
