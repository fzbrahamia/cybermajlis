import type { ComponentType } from "react";
import VirusForkBomb from "./sims/demo_virus";
import DemoRootkit   from "./sims/demo_rootkit";
import DemoKeylogger from "./sims/demo_keylogger";
import WormDemo      from "./sims/demo_worm";
import PolyDemo      from "./sims/demo_poly";
import MetaDemo      from "./sims/demo_meta";
import RansomwareDemo from "./sims/demo_ransomware";

export const SIM_MAP: Record<string, ComponentType<{ onHome: () => void }>> = {
  virus:       VirusForkBomb,
  rootkit:     DemoRootkit,
  keylogger:   DemoKeylogger,
  worm:        WormDemo,
  polymorphic: PolyDemo,
  metamorphic: MetaDemo,
  ransomware:  RansomwareDemo,
};
