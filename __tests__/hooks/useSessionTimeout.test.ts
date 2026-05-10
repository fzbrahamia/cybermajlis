import { renderHook, act } from "@testing-library/react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

// @ts-ignore
delete window.location;
// @ts-ignore
window.location = { href: "" };

jest.mock("@/app/lib/firebase", () => ({
  auth: {
    get currentUser() {
      return { uid: "user123" };
    },
  },
}));

const mockSignOut = jest.fn().mockResolvedValue(undefined);
jest.mock("firebase/auth", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe("useSessionTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSignOut.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("showWarning is false on mount", () => {
    const { result } = renderHook(() => useSessionTimeout());
    expect(result.current.showWarning).toBe(false);
  });

  it("returns stayLoggedIn and logOutNow functions", () => {
    const { result } = renderHook(() => useSessionTimeout());
    expect(typeof result.current.stayLoggedIn).toBe("function");
    expect(typeof result.current.logOutNow).toBe("function");
  });

  it("shows warning after 14+ minutes of inactivity", async () => {
    const { result } = renderHook(() => useSessionTimeout());
    await act(async () => {
      jest.advanceTimersByTime(14 * 60 * 1000 + 30 * 1000);
      await Promise.resolve();
    });
    expect(result.current.showWarning).toBe(true);
  });

  it("stayLoggedIn hides the warning", async () => {
    const { result } = renderHook(() => useSessionTimeout());
    await act(async () => {
      jest.advanceTimersByTime(14 * 60 * 1000 + 30 * 1000);
      await Promise.resolve();
    });
    expect(result.current.showWarning).toBe(true);
    act(() => { result.current.stayLoggedIn(); });
    expect(result.current.showWarning).toBe(false);
  });

  it("logOutNow calls firebase signOut", async () => {
    const { result } = renderHook(() => useSessionTimeout());
    await act(async () => { await result.current.logOutNow(); });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("logOutNow hides the warning", async () => {
    const { result } = renderHook(() => useSessionTimeout());
    await act(async () => { await result.current.logOutNow(); });
    expect(result.current.showWarning).toBe(false);
  });
});
