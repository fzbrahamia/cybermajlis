import { lessonsData } from "@/app/lib/lessonsData";

const REQUIRED_FIELDS = ["slug", "image", "videoUrl", "simulationUrl", "posterUrl", "quizUrl"] as const;

describe("lessonsData structure", () => {
  it("groups lessons by subject, not by difficulty", () => {
    expect(lessonsData).toHaveProperty("malware");
    // basic/advanced were difficulty tiers of the same subject and were merged.
    expect(lessonsData).not.toHaveProperty("basic");
    expect(lessonsData).not.toHaveProperty("advanced");
  });

  it("each category is an array", () => {
    Object.values(lessonsData).forEach(category => {
      expect(Array.isArray(category)).toBe(true);
    });
  });
});

describe("malware lessons", () => {
  it("contains exactly 4 lessons", () => {
    expect(lessonsData.malware).toHaveLength(4);
  });

  it("contains every malware slug", () => {
    const slugs = lessonsData.malware.map(l => l.slug);
    expect(slugs).toContain("virus");
    expect(slugs).toContain("worm");
    expect(slugs).toContain("ransomware");
    expect(slugs).toContain("polymorphic-metamorphic");
  });

  it("all slugs are unique and non-empty", () => {
    const slugs = lessonsData.malware.map(l => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach(slug => expect(slug.length).toBeGreaterThan(0));
  });

  it("every lesson has the required fields", () => {
    lessonsData.malware.forEach(lesson => {
      REQUIRED_FIELDS.forEach(field => {
        expect(lesson).toHaveProperty(field);
      });
    });
  });

  it("every lesson has a non-empty image path", () => {
    lessonsData.malware.forEach(lesson => {
      expect(typeof lesson.image).toBe("string");
      expect(lesson.image.length).toBeGreaterThan(0);
    });
  });

  it("every lesson has a non-empty videoUrl", () => {
    lessonsData.malware.forEach(lesson => {
      expect(typeof lesson.videoUrl).toBe("string");
      expect(lesson.videoUrl.length).toBeGreaterThan(0);
    });
  });

  it("keeps its original translation keys after the merge", () => {
    const keys = lessonsData.malware.map(l => l.titleKey);
    expect(keys).toContain("basic.virus.title");
    expect(keys).toContain("advanced.polymorphic-metamorphic.title");
  });
});
