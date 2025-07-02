import Link from "next/link";
import SignInForm from "@/features/auth/components/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-autopulse-grey flex flex-col items-center justify-center p-4">
      <div className="absolute top-8">
        <Link href="/">
          <h1 className="text-3xl font-bold text-autopulse-orange">AutoPulse</h1>
        </Link>
      </div>
      <SignInForm />
    </div>
  );
} 