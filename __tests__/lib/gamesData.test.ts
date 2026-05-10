import { GAMES, GAME_DIFF, GAME_LEARN } from "@/app/lib/gamesData";

describe("GAMES array", () => {
  it("contains 16 games", () => {
    expect(GAMES).toHaveLength(16);
  });

  it("every game has required fields", () => {
    GAMES.forEach(game => {
      expect(typeof game.id).toBe("string");
      expect(game.id.length).toBeGreaterThan(0);
      expect(typeof game.name).toBe("string");
      expect(game.name.length).toBeGreaterThan(0);
      expect(typeof game.nameAr).toBe("string");
      expect(game.nameAr.length).toBeGreaterThan(0);
      expect(typeof game.mechanic).toBe("string");
      expect(Array.isArray(game.skills)).toBe(true);
      expect(game.skills.length).toBeGreaterThan(0);
    });
  });

  it("all game IDs are unique", () => {
    const ids = GAMES.map(g => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every game has a char assigned", () => {
    GAMES.forEach(game => {
      expect(game.char).toBeDefined();
    });
  });
});

describe("GAME_DIFF", () => {
  it("has an entry for every game in GAMES", () => {
    GAMES.forEach(game => {
      expect(GAME_DIFF).toHaveProperty(game.id);
    });
  });

  it("every entry has stars between 1 and 3", () => {
    Object.values(GAME_DIFF).forEach(diff => {
      expect(diff.stars).toBeGreaterThanOrEqual(1);
      expect(diff.stars).toBeLessThanOrEqual(3);
    });
  });

  it("every entry has a non-empty time string", () => {
    Object.values(GAME_DIFF).forEach(diff => {
      expect(typeof diff.time).toBe("string");
      expect(diff.time.length).toBeGreaterThan(0);
    });
  });
});

describe("GAME_LEARN", () => {
  it("has an entry for every game in GAMES", () => {
    GAMES.forEach(game => {
      expect(GAME_LEARN).toHaveProperty(game.id);
    });
  });

  it("every entry is a non-empty array of strings", () => {
    Object.values(GAME_LEARN).forEach(items => {
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => expect(typeof item).toBe("string"));
    });
  });
});
