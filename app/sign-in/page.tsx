"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo_clarapi.png"
              alt="Clarapi Logo"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Authenticator
          initialState="signIn"
          hideSignUp={false}
        >
          {({ user }) => {
            if (user) {
              router.push("/");
            }
            return null;
          }}
        </Authenticator>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
