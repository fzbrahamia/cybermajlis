import "@testing-library/jest-dom";
import { genLB } from "@/app/lib/leaderboard";

describe("genLB", () => {
  it("returns exactly 15 entries", () => {
    expect(genLB(1000)).toHaveLength(15);
  });

  it("includes exactly one 'You' entry", () => {
    const lb = genLB(1000);
    expect(lb.filter(e => e.isYou)).toHaveLength(1);
  });

  it("'You' entry has the exact XP passed in", () => {
    expect(genLB(500).find(e => e.isYou)?.xp).toBe(500);
    expect(genLB(9999).find(e => e.isYou)?.xp).toBe(9999);
    expect(genLB(0).find(e => e.isYou)?.xp).toBe(0);
  });

  it("is sorted by XP descending", () => {
    const lb = genLB(1000);
    for (let i = 0; i < lb.length - 1; i++) {
      expect(lb[i].xp).toBeGreaterThanOrEqual(lb[i + 1].xp);
    }
  });

  it("every entry has a name, avatar, xp, and games field", () => {
    genLB(500).forEach(entry => {
      expect(typeof entry.name).toBe("string");
      expect(typeof entry.avatar).toBe("string");
      expect(typeof entry.xp).toBe("number");
      expect(typeof entry.games).toBe("number");
    });
  });

  it("non-You entries have isYou = false", () => {
    genLB(100)
      .filter(e => !e.isYou)
      .forEach(e => expect(e.isYou).toBe(false));
  });
});
