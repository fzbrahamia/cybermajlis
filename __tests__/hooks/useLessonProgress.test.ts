import { renderHook, act } from "@testing-library/react";
import { useLessonProgress } from "@/hooks/useLessonProgress";

const mockUser = { uid: "user123" };

const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn().mockResolvedValue(undefined);

jest.mock("@/app/lib/firebase", () => ({
  auth: { currentUser: { uid: "user123" } },
  db: {},
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, cb: (u: typeof mockUser) => void) => {
    cb(mockUser);
    return () => {};
  },
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "mockDocRef"),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}));

const savedProgress = {
  storyDone: true,
  demoDone: false,
  posterDone: true,
  quizDone: false,
  quizRetakes: 2,
};

const defaultProgress = {
  storyDone: false,
  demoDone: false,
  posterDone: false,
  quizDone: false,
  quizRetakes: 0,
};

describe("useLessonProgress", () => {
  beforeEach(() => {
    mockGetDoc.mockClear();
    mockSetDoc.mockClear();
  });

  it("starts with loading = true", () => {
    mockGetDoc.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useLessonProgress("virus"));
    expect(result.current.loading).toBe(true);
  });

  it("loads saved progress from Firestore", async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => savedProgress });
    const { result } = renderHook(() => useLessonProgress("virus"));
    await act(async () => { await Promise.resolve(); });
    expect(result.current.progress).toEqual(savedProgress);
    expect(result.current.loading).toBe(false);
  });

  it("uses default progress when no saved data exists", async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false, data: () => null });
    const { result } = renderHook(() => useLessonProgress("virus"));
    await act(async () => { await Promise.resolve(); });
    expect(result.current.progress).toEqual(defaultProgress);
  });

  it("sets loading to false after fetch completes", async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false, data: () => null });
    const { result } = renderHook(() => useLessonProgress("virus"));
    await act(async () => { await Promise.resolve(); });
    expect(result.current.loading).toBe(false);
  });

  it("update merges fields into current progress", async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false, data: () => null });
    const { result } = renderHook(() => useLessonProgress("virus"));
    await act(async () => { await Promise.resolve(); });
    await act(async () => { await result.current.update({ storyDone: true }); });
    expect(result.current.progress.storyDone).toBe(true);
    expect(result.current.progress.demoDone).toBe(false); // unchanged
  });

  it("update calls setDoc to persist changes", async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false, data: () => null });
    const { result } = renderHook(() => useLessonProgress("virus"));
    await act(async () => { await Promise.resolve(); });
    await act(async () => { await result.current.update({ quizDone: true }); });
    expect(mockSetDoc).toHaveBeenCalled();
  });

  it("update writes to both subcollection and top-level doc", async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false, data: () => null });
    const { result } = renderHook(() => useLessonProgress("worm"));
    await act(async () => { await Promise.resolve(); });
    await act(async () => { await result.current.update({ demoDone: true }); });
    expect(mockSetDoc).toHaveBeenCalledTimes(2);
  });
});
