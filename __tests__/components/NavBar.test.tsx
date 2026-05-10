import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/ui/NavBar";

// ── Mock heavy dependencies ──────────────────────────────────
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

jest.mock("@/app/lib/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, cb: (u: null) => void) => {
    cb(null);
    return () => {};
  },
  signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(() => () => {}),
  addDoc: jest.fn(),
  collection: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock("@/components/Modal", () => ({
  __esModule: true,
  default: () => null,
}));

// ── Tests ────────────────────────────────────────────────────
describe("Navbar", () => {
  it("renders the logo image", () => {
    render(<Navbar />);
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  it("shows the login button when user is not logged in", () => {
    render(<Navbar />);
    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("login button links to /auth", () => {
    render(<Navbar />);
    const loginLink = screen.getByText("login").closest("a");
    expect(loginLink).toHaveAttribute("href", "/auth");
  });

  it("shows EN and AR language toggle buttons", () => {
    render(<Navbar />);
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("عربي")).toBeInTheDocument();
  });

  it("does not show Live SOC button on main page", () => {
    render(<Navbar />);
    expect(screen.queryByText("live_soc")).not.toBeInTheDocument();
  });
});
