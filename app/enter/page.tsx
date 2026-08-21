"use client";

/* The Majlis door.

   CyberMajlis keeps its own at /auth: its own maroon, its own navbar, its own
   dashboard to return to. This one is cream and gold and returns to /learn.

   The flow underneath is deliberately shared. The Firebase calls, the username
   reservation and the open-redirect guard are security-relevant, and two copies
   of those would eventually disagree with each other. Only the look and the
   destination differ, and those differ completely. */

import StepperFlow from "@/components/AuthStepper";

export default function Enter() {
  return <StepperFlow brand="majlis" />;
}
