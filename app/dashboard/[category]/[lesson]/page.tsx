"use client";

import * as React from "react";
import { lessonsData } from "@/app/lib/lessonsData";
import LessonDetailPage from "@/components/ui/lessonDetailPage";

export default function LessonPage({ params }: { params: Promise<{ category: string; lesson: string }> }) {
  const resolvedParams = React.use(params);
  const category = resolvedParams?.category;
  const lesson = resolvedParams?.lesson;

  if (!category || !lesson) return null;

  const lessonInfo = (lessonsData as any)[category]?.find(
    (l: any) => l.slug === lesson
  );

  if (!lessonInfo) return <p className="text-white p-8">Lesson not found</p>;

  return <LessonDetailPage lesson={lessonInfo} />;
}