import { createClient } from '@/lib/supabase/server'
import { Header }       from '@/components/layout/Header'
import { Footer }       from '@/components/layout/Footer'
import Link             from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'How It Works' }

const CUSTOMER_STEPS = [
  {
    n:     '01',
    title: 'Describe your job',
    body:  'Select the furniture items you need assembled from our catalogue — wardrobes, beds, shelving, dining sets and more. Add your postcode and a preferred date.',
    detail: 'Takes about 2 minutes. No account needed to browse — you only register when you\'re ready to post.',
  },
  {
    n:     '02',
    title: 'We match a local fitter',
    body:  'Your job is sent to verified fitters in your area. We check their credentials, reviews and availability before making a match.',
    detail: 'Most jobs are matched within 24-48 hours. You\'ll get an email notification and can see your fitter\'s profile in your dashboard.',
  },
  {
    n:     '03',
    title: 'Your fitter arrives',
    body:  'Agree a time with your fitter directly by phone or through the built-in messaging. They arrive, assemble everything, and leave your space clean and tidy.',
    detail: 'You pay your fitter directly for their work. We don\'t take a commission.',
  },
  {
    n:     '04',
    title: 'Leave a review',
    body:  'Rate your experience and leave a review for your fitter. Reviews help other customers choose trusted professionals.',
    detail: 'Fitters can also leave you a review, building a mutual reputation on the platform.',
  },
]

const FITTER_STEPS = [
  {
    n:     '01',
    title: 'Register and verify',
    body:  'Create a free fitter account and upload your Public Liability Insurance and DBS certificate. We\'ll verify your documents within 48 hours.',
    detail: 'No monthly fees. No subscription. You only pay for the leads you want.',
  },
  {
    n:     '02',
    title: 'Set your service area',
    body:  'Enter your base postcode and how far you\'re willing to travel. Only jobs within your radius appear in your leads feed.',
    detail: 'You can change your radius and postcode at any time from your dashboard.',
  },
  {
    n:     '03',
    title: 'Browse and unlock leads',
    body:  'See the job details, location and estimated value before you commit. Unlock leads you want with credits — unused credits never expire.',
    detail: 'Once unlocked you get the customer\'s full contact details and can arrange the job directly.',
  },
  {
    n:     '04',
    title: 'Build your reputation',
    body:  'Complete jobs, collect five-star reviews, and grow your profile. Top-rated fitters appear first in matched results.',
    detail: 'Your public profile page shows your rating, completed jobs count and customer reviews.',
  },
]

const FAQS = [
  {
    q: 'How much does it cost to post a job?',
    a: 'Nothing — posting a job is completely free for customers. You only pay your fitter directly for their work.',
  },
  {
    q: 'How are fitters verified?',
    a: 'Every fitter must upload Public Liability Insurance and a DBS certificate before they can receive leads. We review and approve each document manually.',
  },
  {
    q: 'What furniture do you cover?',
    a: 'Any flat-pack furniture across all major retailers — IKEA, Argos, Wayfair, John Lewis, Next, and more. Wardrobes, beds, kitchens, shelving, desks, dining sets and everything in between.',
  },
  {
    q: 'How quickly will I be matched?',
    a: 'Most jobs are matched within 24-48 hours. Urgent jobs in areas with high fitter density are often matched within a few hours.',
  },
  {
    q: 'What are credits?',
    a: 'Credits are purchased by fitters to unlock leads. 1 credit typically unlocks 1 job lead. Credits are priced from £1.20 each depending on pack size, and they never expire.',
  },
  {
    q: 'Do you take a commission from fitters?',
    a: 'No. Fitters keep 100% of what they charge. We make our revenue from credit pack sales to fitters.',
  },
  {
    q: 'What if I\'m not happy with the work?',
    a: 'Contact your fitter directly first — most issues are resolved quickly. If you need further help, contact our support team and we\'ll mediate.',
  },
]

export default async function HowItWorksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const S = { fontFamily: "'DM Sans',system-ui,sans-serif" }
  const SYNE = { fontFamily: "'Syne',sans-serif" }

  return (
    <>
      <Header profile={profile} />
      <main style={{ ...S }}>

        {/* Hero */}
        <div style={{ background: '#0a1628', padding: '60px 24px 56px', textAlign: 'center' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f0a500', marginBottom: 14 }}>Simple by design</p>
            <h1 style={{ ...SYNE, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-2px', marginBottom: 16 }}>
              How It Works
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', fontWeight: 300, lineHeight: 1.75 }}>
              Whether you need furniture built or you build furniture for a living, we've made the process as simple as possible.
            </p>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0 }}>
            <a href="#customers" style={{ ...S, padding: '16px 24px', fontSize: 14, fontWeight: 600, color: '#0a1628', textDecoration: 'none', borderBottom: '2px solid #f0a500' }}>For Customers</a>
            <a href="#fitters"   style={{ ...S, padding: '16px 24px', fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none', borderBottom: '2px solid transparent' }}>For Fitters</a>
            <a href="#faq"       style={{ ...S, padding: '16px 24px', fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none', borderBottom: '2px solid transparent' }}>FAQ</a>
          </div>
        </div>

        {/* For Customers */}
        <section id="customers" style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f0a500', marginBottom: 10 }}>For customers</p>
            <h2 style={{ ...SYNE, fontSize: 32, fontWeight: 800, color: '#0a1628', letterSpacing: '-1px', marginBottom: 8 }}>Getting your furniture built</h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>Free to post. Matched with a verified local fitter. You pay the fitter directly for their work — we never take a cut.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {CUSTOMER_STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 24, paddingBottom: 40, position: 'relative' }}>
                {i < CUSTOMER_STEPS.length - 1 && (
                  <div style={{ position: 'absolute', left: 30, top: 64, bottom: 0, width: 2, background: '#f0f2f5' }} />
                )}
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#0a1628', color: '#f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SYNE, fontWeight: 800, fontSize: 16, flexShrink: 0, position: 'relative', zIndex: 1, border: '4px solid #f8f9fc' }}>
                  {step.n}
                </div>
                <div style={{ paddingTop: 12 }}>
                  <h3 style={{ ...SYNE, fontSize: 19, fontWeight: 700, color: '#0a1628', letterSpacing: '-0.4px', marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 8 }}>{step.body}</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65 }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <Link href="/auth/register-customer" style={{ display: 'inline-block', padding: '14px 32px', background: '#f0a500', color: '#0a1628', borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Post a Job — Free
            </Link>
          </div>
        </section>

        {/* For Fitters */}
        <section id="fitters" style={{ background: '#fff', padding: '64px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f0a500', marginBottom: 10 }}>For fitters</p>
              <h2 style={{ ...SYNE, fontSize: 32, fontWeight: 800, color: '#0a1628', letterSpacing: '-1px', marginBottom: 8 }}>Building a steady income</h2>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>No agency fees, no monthly subscription. Browse real jobs, buy only the leads you want, keep everything you earn.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FITTER_STEPS.map((step, i) => (
                <div key={step.n} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 24, paddingBottom: 40, position: 'relative' }}>
                  {i < FITTER_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', left: 30, top: 64, bottom: 0, width: 2, background: '#f0f2f5' }} />
                  )}
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0a500', color: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SYNE, fontWeight: 800, fontSize: 16, flexShrink: 0, position: 'relative', zIndex: 1, border: '4px solid #fff' }}>
                    {step.n}
                  </div>
                  <div style={{ paddingTop: 12 }}>
                    <h3 style={{ ...SYNE, fontSize: 19, fontWeight: 700, color: '#0a1628', letterSpacing: '-0.4px', marginBottom: 8 }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 8 }}>{step.body}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65 }}>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <Link href="/auth/register-fitter" style={{ display: 'inline-block', padding: '14px 32px', background: '#0a1628', color: '#fff', borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Register as a Fitter
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f0a500', marginBottom: 10 }}>Got questions?</p>
            <h2 style={{ ...SYNE, fontSize: 32, fontWeight: 800, color: '#0a1628', letterSpacing: '-1px' }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <details key={i} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, overflow: 'hidden' }}>
                <summary style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#0a1628', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                  {faq.q}
                  <span style={{ fontSize: 18, color: '#94a3b8', flexShrink: 0, marginLeft: 12 }}>+</span>
                </summary>
                <div style={{ padding: '0 20px 16px', fontSize: 13, color: '#475569', lineHeight: 1.75 }}>{faq.a}</div>
              </details>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48, padding: '32px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0' }}>
            <h3 style={{ ...SYNE, fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>Still have questions?</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Our team is happy to help with anything not covered above.</p>
            <a href="mailto:hello@nationalflatpackassembly.co.uk" style={{ display: 'inline-block', padding: '10px 24px', background: '#0a1628', color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Contact Us
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
