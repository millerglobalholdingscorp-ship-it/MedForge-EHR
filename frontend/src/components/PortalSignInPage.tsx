import { SignIn } from '@clerk/clerk-react';

export default function PortalSignInPage() {
  return <div className="mx-auto max-w-md px-4 py-16"><h1 className="mb-8 text-center text-2xl font-bold text-slate-900">Sign in to your Patient Portal</h1><SignIn routing="path" path="/portal/sign-in" signUpUrl="/portal/sign-up" /></div>;
}
