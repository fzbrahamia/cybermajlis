import { lessonsData } from "@/app/lib/lessonsData";

const REQUIRED_FIELDS = ["slug", "image", "videoUrl", "simulationUrl", "posterUrl", "quizUrl"] as const;
const COMPLETE_LESSONS = ["basic"] as const;

describe("lessonsData structure", () => {
  it("has basic, advanced, and realtime categories", () => {
    expect(lessonsData).toHaveProperty("basic");
    expect(lessonsData).toHaveProperty("advanced");
    expect(lessonsData).toHaveProperty("realtime");
  });

  it("each category is an array", () => {
    Object.values(lessonsData).forEach(category => {
      expect(Array.isArray(category)).toBe(true);
    });
  });
});

describe("basic lessons", () => {
  it("contains exactly 3 lessons", () => {
    expect(lessonsData.basic).toHaveLength(3);
  });

  it("contains virus, worm, and ransomware slugs", () => {
    const slugs = lessonsData.basic.map(l => l.slug);
    expect(slugs).toContain("virus");
    expect(slugs).toContain("worm");
    expect(slugs).toContain("ransomware");
  });

  it("all slugs are unique", () => {
    const slugs = lessonsData.basic.map(l => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every lesson has the required fields", () => {
    lessonsData.basic.forEach(lesson => {
      REQUIRED_FIELDS.forEach(field => {
        expect(lesson).toHaveProperty(field);
      });
    });
  });

  it("every lesson has a non-empty image path", () => {
    lessonsData.basic.forEach(lesson => {
      expect(typeof lesson.image).toBe("string");
      expect(lesson.image.length).toBeGreaterThan(0);
    });
  });

  it("every lesson has a non-empty videoUrl", () => {
    lessonsData.basic.forEach(lesson => {
      expect(typeof lesson.videoUrl).toBe("string");
      expect(lesson.videoUrl.length).toBeGreaterThan(0);
    });
  });
});
