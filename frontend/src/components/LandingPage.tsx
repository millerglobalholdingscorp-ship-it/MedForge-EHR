import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, type FormEvent } from 'react';

/* ------------------------------------------------------------------ */
/*  Inline SVG icon components                                        */
/* ------------------------------------------------------------------ */
function IconUnifiedRecords() {
  return (
    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconCareCoordination() {
  return (
    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconComplianceReady() {
  return (
    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconTelehealth() {
  return (
    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function IconSmartScheduling() {
  return (
    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook for fade-in animations                 */
/* ------------------------------------------------------------------ */
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  Feature data                                                      */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: <IconUnifiedRecords />,
    title: 'Unified Records',
    desc: 'Manage patient records, demographics, medical history, and documents from a single, intuitive interface.',
  },
  {
    icon: <IconCareCoordination />,
    title: 'Care Coordination',
    desc: 'Seamlessly coordinate care across providers, specialties, and facilities with shared access and real-time updates.',
  },
  {
    icon: <IconComplianceReady />,
    title: 'Compliance Ready',
    desc: 'Built with HIPAA compliance at the core — audit trails, role-based access, and encrypted data at rest and in transit.',
  },
  {
    icon: <IconTelehealth />,
    title: 'Telehealth Integration',
    desc: 'Launch secure video visits directly from the patient record. Native telehealth, no third-party plugins required.',
  },
  {
    icon: <IconSmartScheduling />,
    title: 'Smart Scheduling',
    desc: 'Intelligent appointment booking with provider availability, automated reminders, and waitlist management.',
  },
  {
    icon: <IconAnalytics />,
    title: 'Analytics & Reporting',
    desc: 'Actionable dashboards and custom reports to track outcomes, optimize operations, and meet quality benchmarks.',
  },
];

/* ------------------------------------------------------------------ */
/*  Feature card with fade-in                                         */
/* ------------------------------------------------------------------ */
function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`p-6 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-300 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact form                                                      */
/* ------------------------------------------------------------------ */
type FormState = 'idle' | 'loading' | 'success' | 'error';

function ContactForm() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState('loading');
    setErrorMessage('');

    const form = e.currentTarget;
    const data = {
      fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      organization: (form.elements.namedItem('organization') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed (${res.status})`);
      }

      setFormState('success');
      form.reset();
    } catch (err) {
      setFormState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (formState === 'success') {
    return (
      <div className="max-w-lg mx-auto p-8 rounded-xl border border-teal-500/30 bg-teal-500/5 text-center">
        <svg className="w-12 h-12 text-teal-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Thanks! We'll be in touch.</h3>
        <p className="mt-2 text-gray-400">
          Our team will reach out to you shortly to schedule a demo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5" noValidate>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
          placeholder="Dr. Jane Smith"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
          placeholder="jane@example.com"
        />
      </div>
      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-300 mb-1.5">
          Organization
        </label>
        <input
          type="text"
          id="organization"
          name="organization"
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
          placeholder="Springfield General Hospital"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors resize-y"
          placeholder="Tell us about your practice and what you're looking for..."
        />
      </div>

      {formState === 'error' && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {errorMessage || 'Something went wrong. Please try again.'}
        </div>
      )}

      <button
        type="submit"
        disabled={formState === 'loading'}
        className="w-full py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors shadow-lg shadow-teal-600/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {formState === 'loading' ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending...
          </>
        ) : (
          'Request a Demo'
        )}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  LandingPage                                                       */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          Now in private beta
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          <span className="text-teal-400">Modern EHR</span>
          <br className="sm:hidden" />
          <span className="text-white"> for modern care</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          MedForge EHR gives your team one secure, unified platform for patient records,
          care coordination, and compliance — whether you're at the bedside or on a video call.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-500 transition-colors shadow-lg shadow-teal-600/25"
          >
            Request a Demo
          </a>
          <a
            href="#features"
            className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium hover:border-gray-500 hover:text-gray-100 transition-colors"
          >
            Learn More
          </a>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 rounded-lg text-gray-500 font-medium text-sm hover:text-gray-300 transition-colors"
          >
            Go to Dashboard →
          </Link>
        </div>

        {/* Hero visual: subtle decorative element */}
        <div className="mt-16 relative max-w-3xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <p className="text-teal-400 text-sm font-semibold tracking-wide uppercase">Features</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">
            Everything you need to deliver great care
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            From patient intake to analytics, MedForge EHR covers the full clinical workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-400 text-sm font-semibold tracking-wide uppercase">Get Started</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">
              See MedForge EHR in action
            </h2>
            <p className="mt-4 text-gray-400">
              Fill out the form below and our team will reach out to schedule a personalized demo.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl border border-gray-800 bg-gray-900/50">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ---------- Footer CTA ---------- */}
      <section className="border-t border-gray-800 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to modernize your practice?
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-lg mx-auto">
            Join the healthcare providers already transforming their clinical workflow with MedForge EHR.
          </p>
          <div className="mt-8">
            <a
              href="#contact"
              className="inline-flex items-center px-8 py-4 rounded-lg bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors shadow-lg shadow-teal-600/25"
            >
              Request a Demo
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
