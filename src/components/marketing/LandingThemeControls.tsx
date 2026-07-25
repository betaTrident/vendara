"use client";

import { ThemeMenu } from "@/components/app/theme/ThemeMenu";
import { ThemeProvider } from "@/components/app/theme/ThemeProvider";

export const LandingThemeControls = () => (
  <ThemeProvider>
    <ThemeMenu className="landing-theme-menu" />
  </ThemeProvider>
);
