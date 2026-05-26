import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components';

export default function WelcomeEmail({ brandName, embedKey, appUrl }: { brandName: string; embedKey: string; appUrl: string }) {
  const snippet = `<script async src="${appUrl}/widget/widget.js" data-sceneva-key="${embedKey}"></script>`;
  return (
    <Html>
      <Head />
      <Preview>Welcome to Sceneva — your widget is ready to install.</Preview>
      <Body style={{ background: '#F8FAFC', fontFamily: '-apple-system, sans-serif', padding: '40px 20px' }}>
        <Container style={{ maxWidth: 560, background: '#fff', borderRadius: 14, padding: 36, border: '1px solid #E4EAF3' }}>
          <Heading style={{ fontSize: 22, color: '#0F172A', margin: 0 }}>Welcome to Sceneva, {brandName}!</Heading>
          <Text style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>
            You're all set to add room visualizations to your store. Paste this snippet into your theme's <code>&lt;/body&gt;</code> tag:
          </Text>
          <Section style={{ background: '#0F172A', color: '#93C5FD', padding: 16, borderRadius: 10, marginTop: 14 }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{snippet}</Text>
          </Section>
          <Section style={{ marginTop: 24, textAlign: 'center' as const }}>
            <Link href={`${appUrl}/overview`} style={{ background: '#2458F5', color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
              Open your dashboard
            </Link>
          </Section>
          <Text style={{ color: '#64748B', fontSize: 13, marginTop: 24 }}>
            Questions? Just reply to this email — we read every one.
            <br /><br />
            — The Sceneva team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
