const { allowOnly, sendJson } = require("../lib/http");

module.exports = async (req, res) => {
  if (!allowOnly(req, res, "POST")) return;

  const event = req.body || {};
  if (!event.eventType || !event.data) {
    sendJson(res, 400, { error: "invalid_webhook", message: "웹훅 본문 형식이 올바르지 않습니다." });
    return;
  }

  // 운영 전 필수:
  // 1) eventId 또는 paymentKey를 영속 DB에 기록해 중복 이벤트를 제거합니다.
  // 2) 주문 저장소에서 orderId와 결제 금액·상태를 재검증합니다.
  // 3) PAYMENT_STATUS_CHANGED의 최종 상태(DONE 등)에만 이용 권한을 부여합니다.
  // 4) 가상계좌 및 비동기 결제는 웹훅 결과를 기준으로 처리합니다.
  // 현재는 안전한 구조 준비 단계이므로 결제 권한을 부여하거나 개인정보를 저장하지 않습니다.
  sendJson(res, 200, { received: true, eventType: event.eventType });
};
