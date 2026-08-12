const { randomUUID } = require("crypto");
const { allowOnly, assertString, sendJson } = require("../lib/http");
const { getPlan } = require("../lib/plans");

function getAppOrigin(req) {
  const configuredOrigin = process.env.APP_ORIGIN;
  if (configuredOrigin) return configuredOrigin.replace(/\/$/, "");
  const host = req.headers?.host;
  if (!host) throw new Error("APP_ORIGIN 환경 변수가 설정되지 않았습니다.");
  const protocol = req.headers?.["x-forwarded-proto"] === "http" ? "http" : "https";
  return `${protocol}://${host}`;
}

module.exports = (req, res) => {
  if (!allowOnly(req, res, "POST")) return;

  try {
    const planId = assertString(req.body?.planId, "planId", { max: 50 });
    const plan = getPlan(planId);
    if (!plan) {
      sendJson(res, 400, { error: "invalid_plan", message: "선택한 요금제를 찾을 수 없습니다." });
      return;
    }

    const orderId = `settle_${randomUUID().replace(/-/g, "").slice(0, 32)}`;
    const origin = getAppOrigin(req);
    sendJson(res, 200, {
      orderId,
      amount: plan.amount,
      orderName: plan.orderName,
      currency: plan.currency,
      planId: plan.id,
      successUrl: `${origin}/payment/success.html`,
      failUrl: `${origin}/payment/fail.html`,
    });
  } catch (error) {
    sendJson(res, 400, { error: "invalid_request", message: error.message });
  }
};
