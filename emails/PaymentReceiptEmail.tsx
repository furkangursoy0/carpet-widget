import { Body, Container, Head, Heading, Html, Link, Preview, Text, Hr } from '@react-email/components';

export default function PaymentReceiptEmail({
  brandName,
  amount,
  invoiceUrl,
  periodEnd,
  appUrl,
}: {
  brandName: string;
  amount: string;
  invoiceUrl: string;
  periodEnd: string;
  appUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{`Sceneva — Payment confirmed, ${amount} received`}</Preview>
      <Body style={{ background: '#F8FAFC', fontFamily: '-apple-system, sans-serif', padding: '40px 20px' }}>
        <Container style={{ maxWidth: 560, background: '#fff', borderRadius: 14, padding: 36, border: '1px solid #E4EAF3' }}>
          <Heading style={{ fontSize: 20, color: '#0F172A', margin: 0 }}>
            Payment confirmed ✓
          </Heading>
          <Text style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>
            Hi {brandName}, we've received your payment of <strong>{amount}</strong> for the Sceneva Growth plan.
            Your 1,000 monthly room previews are active and ready.
          </Text>
          <Text style={{ color: '#475569', fontSize: 15, lineHeight: 1.6 }}>
            Your plan renews on <strong>{periodEnd}</strong>. You can manage or cancel anytime from your dashboard.
          </Text>
          <Hr style={{ border: 'none', borderTop: '1px solid #E4EAF3', margin: '24px 0' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              href={`${appUrl}/billing`}
              style={{ display: 'inline-block', background: '#2458F5', color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14, marginRight: 12 }}
            >
              Go to dashboard
            </Link>
            <Link
              href={invoiceUrl}
              style={{ display: 'inline-block', background: '#F1F5F9', color: '#0F172A', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}
            >
              View invoice
            </Link>
          </div>
          <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 24 }}>
            Questions? Reply to this email or contact hello@sceneva.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
