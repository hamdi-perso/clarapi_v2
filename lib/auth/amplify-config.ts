"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

export function configureAmplify() {
  // Disable SSR - this app uses static export, no SSR needed
  Amplify.configure(outputs, {
    ssr: false,
  });
}
