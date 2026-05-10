import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { lessonsData } from "@/app/lib/lessonsData";

export async function seedLessonsData() {
  const categories = ["basic"] as const;
  for (const category of categories) {
    for (const lesson of lessonsData[category]) {
      if (!lesson.slug) continue;
      const ref = doc(db, "lessonsData", lesson.slug);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          lessonID: lesson.slug,
          slug: lesson.slug,
          title: lesson.title || "",
          category,
          image: lesson.image || "",
          videoUrl: lesson.videoUrl || "",
          simulationUrl: lesson.simulationUrl || "",
          posterUrl: lesson.posterUrl || "",
          quizUrl: lesson.quizUrl || "",
          description: "",
        });
      }
    }
  }
}
