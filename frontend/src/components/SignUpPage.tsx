import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-white text-center mb-8">
        Create Your MedForge EHR Account
      </h1>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
