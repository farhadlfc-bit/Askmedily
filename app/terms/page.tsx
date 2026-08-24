export default function Terms() {
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
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 40 }}>Last updated: August 2026</p>

        {[
          { title: '1. Acceptance of terms', content: 'By accessing or using AskMedily, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.' },
          { title: '2. Description of service', content: 'AskMedily provides medication information for educational purposes only. We are not a medical service and do not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making any decisions about your medication or health.' },
          { title: '3. Medical disclaimer', content: 'The information provided on AskMedily is sourced from NHS and FDA publications and is intended for general educational purposes only. It does not replace professional medical advice. Never disregard professional medical advice or delay seeking it because of something you have read on AskMedily.' },
          { title: '4. User accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. We reserve the right to terminate accounts that violate these terms.' },
          { title: '5. Subscription and payments', content: 'Paid subscriptions are billed monthly. You may cancel at any time. Refunds are not provided for partial months. We reserve the right to change pricing with 30 days notice.' },
          { title: '6. My Med History', content: 'The My Med History feature is a personal record-keeping tool only. It is not a medical record and should not be used as a substitute for professional medical records. We are not responsible for any decisions made based on information entered into this feature.' },
          { title: '7. Intellectual property', content: 'All content, features, and functionality of AskMedily are owned by AskMedily and are protected by copyright and other intellectual property laws.' },
          { title: '8. Limitation of liability', content: 'AskMedily shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.' },
          { title: '9. Governing law', content: 'These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.' },
          { title: '10. Contact', content: 'For questions about these terms, please contact us at support@askmedily.com.' },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--muted)' }}>{section.content}</p>
          </div>
        ))}

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 24 }}>
          <a href="/privacy" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy →</a>
          <a href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    </main>
  );
}
