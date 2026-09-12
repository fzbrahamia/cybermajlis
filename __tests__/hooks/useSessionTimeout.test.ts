import { renderHook, act } from "@testing-library/react";
import { useSessionTimeout, WARNING_MS, CHECK_INTERVAL } from "@/hooks/useSessionTimeout";

// The hook navigates via window.location.href on logout, so it has to be
// replaceable. jsdom's location is read-only, hence the delete-and-reassign.
// @ts-expect-error jsdom location is not optional in the DOM lib types
delete window.location;
// @ts-expect-error a bare { href } is enough for what the hook touches
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

  it("shows warning once the idle time passes the warning threshold", async () => {
    const { result } = renderHook(() => useSessionTimeout());
    await act(async () => {
      jest.advanceTimersByTime(WARNING_MS + CHECK_INTERVAL);
      await Promise.resolve();
    });
    expect(result.current.showWarning).toBe(true);
  });

  it("stayLoggedIn hides the warning", async () => {
    const { result } = renderHook(() => useSessionTimeout());
    await act(async () => {
      jest.advanceTimersByTime(WARNING_MS + CHECK_INTERVAL);
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
