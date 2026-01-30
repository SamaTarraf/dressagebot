import Image from "next/image";
import React from 'react';

export default function Home() {
  console.log(require.resolve("@/app/components/SignUp"));
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="\bot"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ask Bot Questions Now!
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="\signup"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sign up
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="\login"
          target="_blank"
          rel="noopener noreferrer"
        >
          Log In
        </a>
      </footer>
    </div>
  );
}
