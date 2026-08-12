const { allowOnly, assertPositiveInteger, assertString, sendJson } = require("../lib/http");
const { confirmPayment } = require("../lib/toss");

module.exports = async (req, res) => {
  if (!allowOnly(req, res, "POST")) return;

  if (process.env.PAYMENTS_LIVE_ENABLED !== "true") {
    sendJson(res, 503, {
      error: "payments_not_enabled",
      message: "결제 운영 설정이 아직 완료되지 않았습니다. 테스트 키와 주문 저장소를 확인해 주세요.",
    });
    return;
  }

  try {
    const paymentKey = assertString(req.body?.paymentKey, "paymentKey", { max: 200 });
    const orderId = assertString(req.body?.orderId, "orderId", { min: 6, max: 64 });
    const amount = assertPositiveInteger(req.body?.amount, "amount");

    // 운영 전 필수: 영속 DB에서 orderId, planId, amount, customerId와 상태(PENDING)를 조회하고
    // 여기의 amount와 비교해야 합니다. 브라우저가 전송한 금액만 신뢰하면 안 됩니다.
    const payment = await confirmPayment({ paymentKey, orderId, amount });
    sendJson(res, 200, {
      ok: true,
      paymentKey: payment.paymentKey,
      orderId: payment.orderId,
      status: payment.status,
      approvedAt: payment.approvedAt,
      totalAmount: payment.totalAmount,
    });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error.providerCode || "payment_confirmation_failed",
      message: error.message || "결제 승인 처리 중 오류가 발생했습니다.",
    });
  }
};
