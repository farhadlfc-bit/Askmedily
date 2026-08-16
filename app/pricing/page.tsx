'use client';
import { CheckCircle, Pill, ArrowLeft } from 'lucide-react';

export default function Pricing() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: 'var(--brand)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Pill size={18} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 18 }}>AskMedily</span>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back
        </a>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Simple, honest pricing</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 12 }}>Start with a 2-day free trial. No credit card required.</p>
        <div style={{ display: 'inline-block', background: '#E8FBF5', color: '#00875A', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 40 }}>
          🎉 2-day free trial on all plans
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            {
              name: 'Basic', price: '£4.99', period: '/month',
              features: ['Drug search & plain English pages', 'Side effects ranked by frequency', 'Drug interaction information', 'NHS & FDA sourced data', 'Mobile friendly'],
              cta: 'Start free trial', highlight: false
            },
            {
              name: 'Premium', price: '£9.99', period: '/month',
              features: ['Everything in Basic', 'AI Condition Agent', 'Personalised medication history', 'Save & bookmark medications', 'Priority support', 'Early access to new features'],
              cta: 'Start free trial', highlight: true
            }
          ].map((plan, i) => (
            <div key={i} style={{
              background: plan.highlight ? 'var(--brand)' : 'white',
              color: plan.highlight ? 'white' : 'var(--foreground)',
              borderRadius: 20, padding: 32, border: '1px solid var(--border)',
              textAlign: 'left', position: 'relative'
            }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--accent)', color: 'white', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  Most Popular
                </div>
              )}
              <p style={{ fontSize: 14, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>{plan.price}</span>
                <span style={{ opacity: 0.7 }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 24 }}>after 2-day free trial</p>
              <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                    <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0, color: plan.highlight ? 'white' : 'var(--accent)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/login" style={{
                display: 'block', textAlign: 'center',
                background: plan.highlight ? 'white' : 'var(--brand)',
                color: plan.highlight ? 'var(--brand)' : 'white',
                padding: '13px', borderRadius: 10, textDecoration: 'none',
                fontWeight: 700, fontSize: 15
              }}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--muted)' }}>
          Cancel anytime. No hidden fees. Secure payments via Stripe.
        </p>
      </div>
    </main>
  );
}
