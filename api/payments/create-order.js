const { randomUUID } = require("crypto");
const { allowOnly, assertString, sendJson } = require("../lib/http");
const { getPlan } = require("../lib/plans");

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
    sendJson(res, 200, {
      orderId,
      amount: plan.amount,
      orderName: plan.orderName,
      currency: plan.currency,
      planId: plan.id,
    });
  } catch (error) {
    sendJson(res, 400, { error: "invalid_request", message: error.message });
  }
};
