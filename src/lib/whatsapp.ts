// Click-to-chat only — no WhatsApp Business API integration (see docs/TRD.md
// section 4). This just builds a wa.me link; every use still requires a
// human click on both ends.
export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export function businessWhatsAppLink(orderSummary: string): string {
  const businessPhone = process.env.BUSINESS_WHATSAPP_NUMBER ?? "2348001234567";
  return buildWhatsAppLink(businessPhone, orderSummary);
}
