const { allowOnly, assertString, sendJson } = require("../lib/http");
const { canUse } = require("../lib/entitlements");
const { createNotificationJob } = require("../lib/notifications");

module.exports = (req, res) => {
  if (!allowOnly(req, res, "POST")) return;

  try {
    // 운영 전 필수: session userId를 기준으로 DB의 구독 상태를 조회해야 합니다.
    const plan = req.body?.plan === "pro" ? "pro" : "free";
    if (!canUse(plan, "notificationAutomation")) {
      sendJson(res, 402, { error: "pro_required", message: "자동 알림 발송은 Pro 구독 기능입니다." });
      return;
    }
    if (process.env.NOTIFICATION_LIVE_ENABLED !== "true") {
      sendJson(res, 503, { error: "notification_not_enabled", message: "알림 공급자 설정이 아직 완료되지 않았습니다." });
      return;
    }

    const job = createNotificationJob({
      templateId: assertString(req.body?.templateId, "templateId", { max: 80 }),
      customerName: assertString(req.body?.customerName, "customerName", { max: 60 }),
      phone: assertString(req.body?.phone, "phone", { max: 30 }),
      orderId: String(req.body?.orderId || "").slice(0, 64),
    });

    // 다음 단계: 여기서 공급자별 어댑터(알림톡/SMS)를 호출하고 결과를 DB에 기록합니다.
    sendJson(res, 202, { ok: true, job });
  } catch (error) {
    sendJson(res, 400, { error: "invalid_notification_request", message: error.message });
  }
};
