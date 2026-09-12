import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import { lessonsData } from "@/app/lib/lessonsData";

/* Writes a lesson doc to Firestore for any lesson that does not have one.
 *
 * firestore.rules allows `create` on lessonsData only when signed in, which is
 * right, so a guest opening the dashboard was guaranteed a permission error.
 * It was caught, but console.error raises the red "1 Issue" badge on Next's
 * dev overlay, so every guest visit looked like something had gone wrong. */
export async function seedLessonsData() {
  // A guest cannot write this and is not supposed to. Not an error.
  if (!auth.currentUser) return;

  const categories = ["malware"] as const;
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
