import Link from "next/link";
import SignUpForm from "@/features/auth/components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-autopulse-grey flex flex-col items-center justify-center p-4">
      <div className="absolute top-8">
        <Link href="/">
          <h1 className="text-3xl font-bold text-autopulse-orange">AutoPulse</h1>
        </Link>
      </div>
      <SignUpForm />
    </div>
  );
} 