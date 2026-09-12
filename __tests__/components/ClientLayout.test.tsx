import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ClientLayout from "@/components/ClientLayout";

// ── Mocks ────────────────────────────────────────────────────

let mockPathname = "/dashboard";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  // ClientLayout renders Footer, and Footer calls useRouter. A partial mock of
  // this module means the whole tree throws before a single assertion runs.
  useRouter: () => ({
    push: jest.fn(), replace: jest.fn(), back: jest.fn(),
    forward: jest.fn(), refresh: jest.fn(), prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  // Footer and the motion toggle inside it both read the locale.
  useLocale: () => "en",
}));

jest.mock("@/components/ui/NavBar", () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar" />,
}));

jest.mock("@/components/Chatbot", () => ({
  __esModule: true,
  default: ({ isLoggedIn }: { isLoggedIn: boolean }) => (
    <div data-testid="chatbot" data-logged-in={String(isLoggedIn)} />
  ),
}));

jest.mock("@/components/Modal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="session-modal" /> : null,
}));

const mockStayLoggedIn = jest.fn();
const mockLogOutNow = jest.fn();
let mockShowWarning = false;

jest.mock("@/hooks/useSessionTimeout", () => ({
  useSessionTimeout: () => ({
    showWarning: mockShowWarning,
    stayLoggedIn: mockStayLoggedIn,
    logOutNow: mockLogOutNow,
  }),
}));

// ── Helpers ──────────────────────────────────────────────────

const renderLayout = (path: string) => {
  mockPathname = path;
  return render(<ClientLayout><div>page content</div></ClientLayout>);
};

// ── Navbar visibility ────────────────────────────────────────

describe("ClientLayout — Navbar", () => {
  it("shows Navbar on /dashboard", () => {
    renderLayout("/dashboard");
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("shows Navbar on /profile", () => {
    renderLayout("/profile");
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("shows Navbar on /auth", () => {
    renderLayout("/auth");
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("shows Navbar on /simulations", () => {
    renderLayout("/simulations");
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("hides Navbar on /calm", () => {
    renderLayout("/calm");
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
  });

  it("hides Navbar on /soc", () => {
    renderLayout("/soc");
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
  });
});

// ── Chatbot visibility ───────────────────────────────────────

describe("ClientLayout — Chatbot", () => {
  it("shows Chatbot on /dashboard", () => {
    renderLayout("/dashboard");
    expect(screen.getByTestId("chatbot")).toBeInTheDocument();
  });

  it("shows Chatbot on /simulations", () => {
    renderLayout("/simulations");
    expect(screen.getByTestId("chatbot")).toBeInTheDocument();
  });

  it("hides Chatbot on /calm", () => {
    renderLayout("/calm");
    expect(screen.queryByTestId("chatbot")).not.toBeInTheDocument();
  });

  it("hides Chatbot on /soc", () => {
    renderLayout("/soc");
    expect(screen.queryByTestId("chatbot")).not.toBeInTheDocument();
  });

  it("hides the chatbot on / (Majlis root, which carries its own chrome)", () => {
    // "/" stopped being the CyberMajlis landing at the Majlis rebrand: it is
    // the parent brand now and supplies its own header, footer and assistant,
    // so ClientLayout suppresses ours. The old expectation of a logged-out
    // chatbot here described the site as it was two rebrands ago.
    renderLayout("/");
    expect(screen.queryByTestId("chatbot")).not.toBeInTheDocument();
  });

  it("marks chatbot isLoggedIn=false on /auth", () => {
    renderLayout("/auth");
    expect(screen.getByTestId("chatbot")).toHaveAttribute("data-logged-in", "false");
  });

  it("marks chatbot isLoggedIn=true on /dashboard", () => {
    renderLayout("/dashboard");
    expect(screen.getByTestId("chatbot")).toHaveAttribute("data-logged-in", "true");
  });
});

// ── Session timeout modal ────────────────────────────────────

describe("ClientLayout — session timeout modal", () => {
  afterEach(() => {
    mockShowWarning = false;
  });

  it("session modal is not shown when showWarning is false", () => {
    mockShowWarning = false;
    renderLayout("/dashboard");
    expect(screen.queryByTestId("session-modal")).not.toBeInTheDocument();
  });

  it("session modal is shown when showWarning is true", () => {
    mockShowWarning = true;
    renderLayout("/dashboard");
    expect(screen.getByTestId("session-modal")).toBeInTheDocument();
  });
});

// ── Children ─────────────────────────────────────────────────

describe("ClientLayout — children", () => {
  it("renders the children content", () => {
    renderLayout("/dashboard");
    expect(screen.getByText("page content")).toBeInTheDocument();
  });
});
