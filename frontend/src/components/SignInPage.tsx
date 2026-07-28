import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-white text-center mb-8">
        Sign In to MedForge EHR
      </h1>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
