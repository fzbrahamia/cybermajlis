import { quizData, quizDataAr } from "@/app/lib/quizData";

const EXPECTED_LESSONS = ["virus", "worm", "ransomware"];

describe.each([
  ["quizData (EN)", quizData],
  ["quizDataAr (AR)", quizDataAr],
])("%s", (_label, data) => {
  it("contains all three lessons", () => {
    EXPECTED_LESSONS.forEach(lesson => {
      expect(data).toHaveProperty(lesson);
    });
  });

  it("each lesson has exactly 5 questions", () => {
    EXPECTED_LESSONS.forEach(lesson => {
      expect(data[lesson]).toHaveLength(5);
    });
  });

  it("every question has a non-empty question string", () => {
    EXPECTED_LESSONS.forEach(lesson => {
      data[lesson].forEach(q => {
        expect(typeof q.question).toBe("string");
        expect(q.question.length).toBeGreaterThan(0);
      });
    });
  });

  it("every question has exactly 4 options", () => {
    EXPECTED_LESSONS.forEach(lesson => {
      data[lesson].forEach(q => {
        expect(q.options).toHaveLength(4);
      });
    });
  });

  it("correctAnswer exists in its options array for every question", () => {
    EXPECTED_LESSONS.forEach(lesson => {
      data[lesson].forEach(q => {
        expect(q.options).toContain(q.correctAnswer);
      });
    });
  });

  it("all options are non-empty strings", () => {
    EXPECTED_LESSONS.forEach(lesson => {
      data[lesson].forEach(q => {
        q.options.forEach(opt => {
          expect(typeof opt).toBe("string");
          expect(opt.length).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe("quizData and quizDataAr parity", () => {
  it("have the same lesson keys", () => {
    expect(Object.keys(quizData).sort()).toEqual(Object.keys(quizDataAr).sort());
  });

  it("have the same number of questions per lesson", () => {
    EXPECTED_LESSONS.forEach(lesson => {
      expect(quizData[lesson]).toHaveLength(quizDataAr[lesson].length);
    });
  });
});
