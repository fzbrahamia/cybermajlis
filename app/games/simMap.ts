import type { ComponentType } from "react";
import VirusForkBomb from "./simulations/demo_virus";
import DemoRootkit   from "./simulations/demo_rootkit";
import DemoKeylogger from "./simulations/demo_keylogger";
import WormDemo      from "./simulations/demo_worm";
import PolyDemo      from "./simulations/demo_poly";
import MetaDemo      from "./simulations/demo_meta";
import RansomwareDemo from "./simulations/demo_ransomware";

export const SIM_MAP: Record<string, ComponentType<{ onHome: () => void }>> = {
  virus:       VirusForkBomb,
  rootkit:     DemoRootkit,
  keylogger:   DemoKeylogger,
  worm:        WormDemo,
  polymorphic: PolyDemo,
  metamorphic: MetaDemo,
  ransomware:  RansomwareDemo,
};
