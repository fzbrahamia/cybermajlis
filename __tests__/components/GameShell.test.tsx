import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameHeader, Result } from "@/components/GameShell";
import type { Character } from "@/app/lib/characters";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

const mockChar: Character = {
  name: "Oryx",
  emoji: "🦌",
  profile: "/characters/oryx.jpeg",
  games: [],
  role: "",
  quote: "",
};

// ── GameHeader ───────────────────────────────────────────────

describe("GameHeader", () => {
  const baseProps = {
    name: "Souq Safe",
    onBack: jest.fn(),
  };

  it("renders the game name", () => {
    render(<GameHeader {...baseProps} />);
    expect(screen.getByText("Souq Safe")).toBeInTheDocument();
  });

  it("renders the score", () => {
    render(<GameHeader {...baseProps} score={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("defaults score to 0 when not provided", () => {
    render(<GameHeader {...baseProps} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders timer in seconds format", () => {
    render(<GameHeader {...baseProps} timer={15} maxTimer={30} />);
    expect(screen.getByText("15s")).toBeInTheDocument();
  });

  it("renders round display when round and maxRound are provided", () => {
    render(<GameHeader {...baseProps} round={2} maxRound={5} />);
    expect(screen.getByText(/2\/5/)).toBeInTheDocument();
  });

  it("does not render round display when round is not provided", () => {
    render(<GameHeader {...baseProps} maxRound={5} />);
    expect(screen.queryByText(/\/5/)).not.toBeInTheDocument();
  });

  it("renders the correct number of life dots", () => {
    const { container } = render(
      <GameHeader {...baseProps} lives={2} maxLives={3} />
    );
    const dots = container.querySelectorAll(".rounded-full.border");
    expect(dots).toHaveLength(3);
  });

  it("filled life dots match the lives prop", () => {
    const { container } = render(
      <GameHeader {...baseProps} lives={2} maxLives={3} />
    );
    const filled = container.querySelectorAll(".bg-red-500.border-red-500");
    expect(filled).toHaveLength(2);
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = jest.fn();
    render(<GameHeader {...baseProps} onBack={onBack} />);
    fireEvent.click(screen.getByText("←"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("does not render timer when timer is not provided", () => {
    render(<GameHeader {...baseProps} />);
    expect(screen.queryByText(/s$/)).not.toBeInTheDocument();
  });
});

// ── Result ───────────────────────────────────────────────────

describe("Result", () => {
  const baseProps = {
    char: mockChar,
    title: "Well done!",
    message: "You completed the game.",
    onRestart: jest.fn(),
    onHome: jest.fn(),
  };

  const renderResult = (score: number, total: number) =>
    render(<Result {...baseProps} score={score} total={total} />);

  const countBrightStars = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("span")).filter(s =>
      s.className.includes("opacity-100")
    ).length;

  it("renders the score", () => {
    const { getByText } = renderResult(8, 10);
    expect(getByText("8")).toBeInTheDocument();
  });

  it("renders the total", () => {
    const { getByText } = renderResult(8, 10);
    expect(getByText(/outOf/)).toHaveTextContent("10");
  });

  it("awards 3 stars for 90%+ score", () => {
    const { container } = renderResult(9, 10); // 90%
    expect(countBrightStars(container)).toBe(3);
  });

  it("awards 3 stars for a perfect score", () => {
    const { container } = renderResult(10, 10); // 100%
    expect(countBrightStars(container)).toBe(3);
  });

  it("awards 2 stars for 60-89% score", () => {
    const { container } = renderResult(7, 10); // 70%
    expect(countBrightStars(container)).toBe(2);
  });

  it("awards 2 stars for exactly 60% score", () => {
    const { container } = renderResult(6, 10); // 60%
    expect(countBrightStars(container)).toBe(2);
  });

  it("awards 1 star for 30-59% score", () => {
    const { container } = renderResult(4, 10); // 40%
    expect(countBrightStars(container)).toBe(1);
  });

  it("awards 1 star for exactly 30% score", () => {
    const { container } = renderResult(3, 10); // 30%
    expect(countBrightStars(container)).toBe(1);
  });

  it("awards 0 stars for less than 30% score", () => {
    const { container } = renderResult(2, 10); // 20%
    expect(countBrightStars(container)).toBe(0);
  });

  it("calls onRestart when play again is clicked", () => {
    const onRestart = jest.fn();
    render(<Result {...baseProps} score={5} total={10} onRestart={onRestart} />);
    fireEvent.click(screen.getByText("playAgain"));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it("calls onHome when all games button is clicked", () => {
    const onHome = jest.fn();
    render(<Result {...baseProps} score={5} total={10} onHome={onHome} />);
    fireEvent.click(screen.getByText("allGames"));
    expect(onHome).toHaveBeenCalledTimes(1);
  });

  it("renders character image with alt text", () => {
    renderResult(5, 10);
    expect(screen.getByAltText("Oryx")).toBeInTheDocument();
  });

  it("renders the title", () => {
    renderResult(5, 10);
    expect(screen.getByText("Well done!")).toBeInTheDocument();
  });

  it("renders the message", () => {
    renderResult(5, 10);
    expect(screen.getByText("You completed the game.")).toBeInTheDocument();
  });
});
