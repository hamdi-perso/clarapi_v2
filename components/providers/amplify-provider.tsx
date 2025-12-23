"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { configureAmplify } from "@/lib/auth/amplify-config";
import "@aws-amplify/ui-react/styles.css";
import { useEffect } from "react";

configureAmplify();

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator.Provider>
      {children}
    </Authenticator.Provider>
  );
}
