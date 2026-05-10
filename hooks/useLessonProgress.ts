import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/app/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface LessonProgress {
  storyDone: boolean;
  demoDone: boolean;
  posterDone: boolean;
  quizDone: boolean;
  quizRetakes: number;
}

const defaultProgress: LessonProgress = {
  storyDone: false,
  demoDone: false,
  posterDone: false,
  quizDone: false,
  quizRetakes: 0,
};

export function useLessonProgress(lessonTitle: string) {
  const [progress, setProgress] = useState<LessonProgress>(defaultProgress);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "user", user.uid, "progress", lessonTitle);
        const snap = await getDoc(ref);
        if (snap.exists()) setProgress(snap.data() as LessonProgress);
      } catch (error) {
        console.error("Progress fetch error:", error);
      } finally {
        setLoading(false); 
      }
    });

    return () => unsubscribe();
  }, [lessonTitle]);


  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  const update = async (fields: Partial<LessonProgress>) => {
    const user = auth.currentUser;
    if (!user) return;

    const updated = { ...progressRef.current, ...fields };
    setProgress(updated);

    try {
      const subcollectionRef = doc(db, "user", user.uid, "progress", lessonTitle);
      const topLevelRef = doc(db, "progress", `${user.uid}_${lessonTitle}`);
      const topLevelData = {
        ...updated,
        userID: user.uid,
        lessonID: lessonTitle,
        progressID: `${user.uid}_${lessonTitle}`,
      };
      await Promise.all([
        setDoc(subcollectionRef, updated, { merge: true }),
        setDoc(topLevelRef, topLevelData, { merge: true }),
      ]);
    } catch (error) {
      console.error("Progress update error:", error);
    }
  };

  return { progress, update, loading };
}