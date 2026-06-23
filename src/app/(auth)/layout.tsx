import Link from "next/link";
import { Wordmark } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8">
        <Wordmark />
      </Link>
      {children}
      <p className="mt-8 text-xs text-ink-faint">
        Wastelytix · Turn Waste Into Value — Showcase Prototype
      </p>
    </div>
  );
}
