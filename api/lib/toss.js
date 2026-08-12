const { randomUUID } = require("crypto");

const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

function getTossSecretKey() {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error("TOSS_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
  return secretKey;
}

function createIdempotencyKey() {
  return randomUUID();
}

async function confirmPayment({ paymentKey, orderId, amount, idempotencyKey = createIdempotencyKey() }) {
  const secretKey = getTossSecretKey();
  const authorization = Buffer.from(`${secretKey}:`).toString("base64");
  const response = await fetch(TOSS_CONFIRM_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
      "Accept-Language": "ko-KR",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "결제 승인에 실패했습니다.");
    error.statusCode = response.status;
    error.providerCode = payload.code;
    throw error;
  }
  return payload;
}

module.exports = { confirmPayment, createIdempotencyKey };
