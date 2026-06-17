"use client";

// Records a single `feature_view` when a feature page mounts.
// A ref guard makes it fire once per mounted instance (so React
// Strict Mode's double-invoke in dev doesn't double-count).

import { useEffect, useRef } from "react";
import { trackFeatureView, trackLessonView } from "@/app/lib/analytics";

export function useTrackView(feature: string) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackFeatureView(feature);
  }, [feature]);
}

// Records a single `lesson_view` once the lesson identifier is known.
export function useTrackLesson(lesson: string | undefined, context: "main" | "elder" | "calm") {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !lesson) return;
    fired.current = true;
    trackLessonView(lesson, context);
  }, [lesson, context]);
}
