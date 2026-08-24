export default function Privacy() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0px 32px', height: '80px', display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/icon.png" alt="AskMedily" style={{ height: 72, width: 72, borderRadius: 10 }} />
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#1a1a2e' }}>Ask</span><span style={{ color: '#0057FF' }}>Medily</span>
          </span>
        </a>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 40 }}>Last updated: August 2026</p>

        {[
          { title: '1. Information we collect', content: 'We collect information you provide directly to us, including your email address and password when you create an account. We also collect medication information you choose to add to your My Med History feature, and usage data such as which medications and conditions you search for.' },
          { title: '2. How we use your information', content: 'We use the information we collect to provide and improve our service, process your subscription payments, send you account-related emails such as confirmation and password reset emails, and to personalise your experience within the app.' },
          { title: '3. My Med History data', content: 'Any medication information you add to My Med History is stored securely and is only accessible by you. We do not share this data with any third parties. This data is self-reported and is not a medical record.' },
          { title: '4. Data sharing', content: 'We do not sell your personal data. We share data only with trusted service providers who help us operate our service, including Supabase (database and authentication), Stripe (payment processing), and Vercel (hosting). All providers are bound by data processing agreements.' },
          { title: '5. Data retention', content: 'We retain your account data for as long as your account is active. If you delete your account, your personal data will be permanently deleted within 30 days. Anonymised usage data may be retained for analytical purposes.' },
          { title: '6. Security', content: 'We implement industry-standard security measures to protect your data, including encrypted data transmission, secure password hashing, and row-level security on our database. However, no method of transmission over the internet is 100% secure.' },
          { title: '7. Your rights', content: 'Under UK GDPR, you have the right to access, correct, or delete your personal data. You can delete your account at any time from the Settings page. For other data requests, please contact us at support@askmedily.com.' },
          { title: '8. Cookies', content: 'We use essential cookies to maintain your login session. We do not use advertising or tracking cookies. You can control cookies through your browser settings, but disabling essential cookies may prevent you from using the service.' },
          { title: '9. Children', content: 'AskMedily is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us.' },
          { title: '10. Changes to this policy', content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email. Continued use of the service after changes constitutes acceptance of the new policy.' },
          { title: '11. Contact', content: 'For privacy-related questions or requests, please contact us at support@askmedily.com.' },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--muted)' }}>{section.content}</p>
          </div>
        ))}

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 24 }}>
          <a href="/terms" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>Terms of Service →</a>
          <a href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    </main>
  );
}
