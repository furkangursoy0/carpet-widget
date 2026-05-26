import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components';

export default function LimitReachedEmail({
  brandName,
  limit,
  appUrl,
}: {
  brandName: string;
  limit: number;
  appUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{`Sceneva — Your ${limit.toLocaleString()} monthly room previews have been used`}</Preview>
      <Body style={{ background: '#F8FAFC', fontFamily: '-apple-system, sans-serif', padding: '40px 20px' }}>
        <Container style={{ maxWidth: 560, background: '#fff', borderRadius: 14, padding: 36, border: '1px solid #E4EAF3' }}>
          <Heading style={{ fontSize: 20, color: '#0F172A', margin: 0 }}>
            Monthly limit reached
          </Heading>
          <Text style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>
            Hi {brandName}, your store has used all <strong>{limit.toLocaleString()}</strong> included room previews this month.
            Shoppers who try to visualize a rug will see a friendly "limit reached" message until your plan resets or you upgrade.
          </Text>
          <Text style={{ color: '#475569', fontSize: 15, lineHeight: 1.6 }}>
            Your previews reset automatically at the start of your next billing period. To keep generating without interruption, upgrade to a higher plan or contact us for a custom arrangement.
          </Text>
          <Link
            href={`${appUrl}/billing`}
            style={{ display: 'inline-block', marginTop: 14, background: '#2458F5', color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}
          >
            View billing & upgrade
          </Link>
          <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 24 }}>
            Questions? Reply to this email or contact hello@sceneva.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
