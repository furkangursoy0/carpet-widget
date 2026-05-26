import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components';

export default function UsageWarningEmail({ brandName, used, limit, appUrl }: { brandName: string; used: number; limit: number; appUrl: string }) {
  const pct = Math.round((used / limit) * 100);
  return (
    <Html>
      <Head />
      <Preview>{`${brandName} — you've used ${pct}% of your Sceneva room previews this month`}</Preview>
      <Body style={{ background: '#F8FAFC', fontFamily: '-apple-system, sans-serif', padding: '40px 20px' }}>
        <Container style={{ maxWidth: 560, background: '#fff', borderRadius: 14, padding: 36, border: '1px solid #E4EAF3' }}>
          <Heading style={{ fontSize: 20, color: '#0F172A', margin: 0 }}>You're at {pct}% of your monthly limit</Heading>
          <Text style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>
            Hi {brandName}, your shoppers have generated <strong>{used.toLocaleString()}</strong> of your{' '}
            <strong>{limit.toLocaleString()}</strong> included room previews this billing period.
          </Text>
          <Text style={{ color: '#475569', fontSize: 15, lineHeight: 1.6 }}>
            If you expect to hit the limit, you can upgrade or buy overage credits.
          </Text>
          <Link href={`${appUrl}/billing`} style={{ display: 'inline-block', marginTop: 14, background: '#2458F5', color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            View billing
          </Link>
        </Container>
      </Body>
    </Html>
  );
}
