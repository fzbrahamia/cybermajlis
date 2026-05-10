import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import LessonDetailPage from "@/components/ui/lessonDetailPage";

// ── Mocks ────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ category: "basic" }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

jest.mock("@/app/lib/firebase", () => ({ auth: { currentUser: null }, db: {} }));

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn().mockResolvedValue({}),
  collection: jest.fn(),
  serverTimestamp: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue({}),
  increment: jest.fn(),
}));

jest.mock("@/components/quiz", () => ({
  __esModule: true,
  default: () => <div data-testid="quiz-component" />,
}));

const mockUpdate = jest.fn();
const mockUseLessonProgress = jest.fn();

jest.mock("@/hooks/useLessonProgress", () => ({
  useLessonProgress: (...args: unknown[]) => mockUseLessonProgress(...args),
}));

// ── Fixtures ─────────────────────────────────────────────────

const mockLesson = {
  slug: "virus",
  title: "Virus",
  videoUrl: "/lessons/vids/virus.mp4",
  simulationUrl: "/demos/virus.mp4",
  posterUrl: "/posters/virus.svg",
  videoCaption: "/captions/eng/basic/virus_story.vtt",
  demoCaption: "/captions/eng/basic/virus_demo.vtt",
  quizUrl: "",
};

const noProgress = {
  storyDone: false,
  demoDone: false,
  posterDone: false,
  quizDone: false,
  quizRetakes: 0,
};

const allDone = {
  storyDone: true,
  demoDone: true,
  posterDone: true,
  quizDone: true,
  quizRetakes: 0,
};

const withProgress = (overrides: Partial<typeof noProgress>) => ({
  ...noProgress,
  ...overrides,
});

const setupProgress = (progress: typeof noProgress) => {
  mockUseLessonProgress.mockReturnValue({
    progress,
    update: mockUpdate,
    loading: false,
  });
};

// ── Tab unlock logic ─────────────────────────────────────────

describe("LessonDetailPage — tab unlock logic", () => {
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it("Story tab is always unlocked", () => {
    setupProgress(noProgress);
    render(<LessonDetailPage lesson={mockLesson} />);
    const storyTab = screen.getByText("tabs.Story").closest("button");
    expect(storyTab).toHaveClass("unlocked");
    expect(storyTab).not.toHaveClass("locked");
  });

  it("Demo tab is locked when story is not done", () => {
    setupProgress(noProgress);
    render(<LessonDetailPage lesson={mockLesson} />);
    const demoTab = screen.getByText("tabs.Demo").closest("button");
    expect(demoTab).toHaveClass("locked");
  });

  it("Demo tab is unlocked when story is done", () => {
    setupProgress(withProgress({ storyDone: true }));
    render(<LessonDetailPage lesson={mockLesson} />);
    const demoTab = screen.getByText("tabs.Demo").closest("button");
    expect(demoTab).toHaveClass("unlocked");
  });

  it("Poster tab is locked when demo is not done", () => {
    setupProgress(withProgress({ storyDone: true }));
    render(<LessonDetailPage lesson={mockLesson} />);
    const posterTab = screen.getByText("tabs.Poster").closest("button");
    expect(posterTab).toHaveClass("locked");
  });

  it("Poster tab is unlocked when demo is done", () => {
    setupProgress(withProgress({ storyDone: true, demoDone: true }));
    render(<LessonDetailPage lesson={mockLesson} />);
    const posterTab = screen.getByText("tabs.Poster").closest("button");
    expect(posterTab).toHaveClass("unlocked");
  });

  it("Quiz tab is locked when poster is not done", () => {
    setupProgress(withProgress({ storyDone: true, demoDone: true }));
    render(<LessonDetailPage lesson={mockLesson} />);
    const quizTab = screen.getByText("tabs.Quiz").closest("button");
    expect(quizTab).toHaveClass("locked");
  });

  it("Quiz tab is unlocked when poster is done", () => {
    setupProgress(withProgress({ storyDone: true, demoDone: true, posterDone: true }));
    render(<LessonDetailPage lesson={mockLesson} />);
    const quizTab = screen.getByText("tabs.Quiz").closest("button");
    expect(quizTab).toHaveClass("unlocked");
  });

  it("all tabs unlocked when all progress is complete", () => {
    setupProgress(allDone);
    render(<LessonDetailPage lesson={mockLesson} />);
    ["tabs.Story", "tabs.Demo", "tabs.Poster", "tabs.Quiz"].forEach(tabText => {
      const tab = screen.getByText(tabText).closest("button");
      expect(tab).toHaveClass("unlocked");
    });
  });
});

// ── Clicking locked tabs ─────────────────────────────────────

describe("LessonDetailPage — clicking locked tabs", () => {
  it("clicking a locked tab does not change the active tab", () => {
    setupProgress(noProgress);
    render(<LessonDetailPage lesson={mockLesson} />);
    const demoTab = screen.getByText("tabs.Demo").closest("button")!;
    fireEvent.click(demoTab);
    // Story should still be active
    const storyTab = screen.getByText("tabs.Story").closest("button");
    expect(storyTab).toHaveClass("active");
  });

  it("clicking an unlocked tab switches the active tab", () => {
    setupProgress(withProgress({ storyDone: true }));
    render(<LessonDetailPage lesson={mockLesson} />);
    const demoTab = screen.getByText("tabs.Demo").closest("button")!;
    fireEvent.click(demoTab);
    expect(demoTab).toHaveClass("active");
  });
});

// ── Progress bar ─────────────────────────────────────────────

describe("LessonDetailPage — progress tracking", () => {
  it("shows 0 completed tasks with no progress", () => {
    setupProgress(noProgress);
    render(<LessonDetailPage lesson={mockLesson} />);
    expect(screen.getByText(/progress_label/)).toBeInTheDocument();
  });

  it("renders the lesson title", () => {
    setupProgress(noProgress);
    render(<LessonDetailPage lesson={mockLesson} />);
    expect(screen.getByText("Virus")).toBeInTheDocument();
  });

  it("shows loading screen when loading is true", () => {
    mockUseLessonProgress.mockReturnValue({
      progress: noProgress,
      update: mockUpdate,
      loading: true,
    });
    render(<LessonDetailPage lesson={mockLesson} />);
    expect(screen.getByText("loading")).toBeInTheDocument();
  });
});

// ── Quiz tab content ─────────────────────────────────────────

describe("LessonDetailPage — Quiz tab", () => {
  it("renders the Quiz component when Quiz tab is active", () => {
    setupProgress(allDone);
    render(<LessonDetailPage lesson={mockLesson} />);
    fireEvent.click(screen.getByText("tabs.Quiz").closest("button")!);
    expect(screen.getByTestId("quiz-component")).toBeInTheDocument();
  });
});
