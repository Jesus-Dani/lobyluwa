const PAYSTACK_BASE_URL = "https://api.paystack.co";

type InitializeTransactionParams = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

type InitializeTransactionResponse = {
  status: boolean;
  message: string;
  data: { authorization_url: string; access_code: string; reference: string };
};

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
  if (!response.ok) {
    throw new Error(`Paystack initialize failed: ${response.status}`);
  }
  return response.json();
}

type VerifyTransactionResponse = {
  status: boolean;
  message: string;
  data: { status: "success" | "failed" | "abandoned"; reference: string; amount: number };
};

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`Paystack verify failed: ${response.status}`);
  }
  return response.json();
}
