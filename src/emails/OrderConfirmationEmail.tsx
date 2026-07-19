import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components";
import { formatNaira } from "@/lib/money";

type OrderConfirmationEmailProps = {
  customerName: string;
  orderId: string;
  items: { name: string; size: string; color: string; quantity: number; unitPrice: number }[];
  total: number;
  whatsappLink: string;
};

export default function OrderConfirmationEmail({
  customerName,
  orderId,
  items,
  total,
  whatsappLink,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your LO BY LUWA order is confirmed</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#ffffff" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Heading style={{ color: "#660019", fontSize: "22px" }}>Thank you, {customerName}!</Heading>
          <Text>Your order #{orderId.slice(-8).toUpperCase()} has been confirmed and payment received.</Text>

          <Section style={{ marginTop: "24px" }}>
            {items.map((item, index) => (
              <Text key={index} style={{ margin: "4px 0" }}>
                {item.quantity}× {item.name} ({item.size} / {item.color}) — {formatNaira(item.unitPrice * item.quantity)}
              </Text>
            ))}
          </Section>

          <Hr />
          <Text style={{ fontWeight: 700, fontSize: "16px" }}>Total: {formatNaira(total)}</Text>
          <Hr />

          <Text>
            To finalize delivery details, chat with us directly on WhatsApp:{" "}
            <a href={whatsappLink}>{whatsappLink}</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
