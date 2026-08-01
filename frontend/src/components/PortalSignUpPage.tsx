import { SignUp } from '@clerk/clerk-react';

export default function PortalSignUpPage() {
  return <div className="mx-auto max-w-md px-4 py-16"><h1 className="mb-8 text-center text-2xl font-bold text-slate-900">Create your Patient Portal account</h1><SignUp routing="path" path="/portal/sign-up" signInUrl="/portal/sign-in" /></div>;
}
