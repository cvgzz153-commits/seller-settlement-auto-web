const assert = require("assert");

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

async function run() {
  const createOrder = require("./api/payments/create-order");
  const confirm = require("./api/payments/confirm");
  const webhook = require("./api/webhooks/toss");

  const orderRes = createResponse();
  createOrder({ method: "POST", headers: { host: "localhost:3000" }, body: { planId: "monthly" } }, orderRes);
  assert.equal(orderRes.statusCode, 200);
  assert.equal(orderRes.body.amount, 4900);
  assert.equal(orderRes.body.planId, "monthly");
  assert.match(orderRes.body.orderId, /^settle_[A-Za-z0-9]+$/);

  const invalidPlanRes = createResponse();
  createOrder({ method: "POST", headers: { host: "localhost:3000" }, body: { planId: "unknown" } }, invalidPlanRes);
  assert.equal(invalidPlanRes.statusCode, 400);

  const confirmRes = createResponse();
  await confirm({ method: "POST", body: { paymentKey: "payment", orderId: "settle_123456", amount: 990 } }, confirmRes);
  assert.equal(confirmRes.statusCode, 503);
  assert.equal(confirmRes.body.error, "payments_not_enabled");

  const webhookRes = createResponse();
  await webhook({ method: "POST", body: { eventType: "PAYMENT_STATUS_CHANGED", data: { paymentKey: "test" } } }, webhookRes);
  assert.equal(webhookRes.statusCode, 200);
  assert.equal(webhookRes.body.received, true);

  const { canUse, getEntitlements } = require("./api/lib/entitlements");
  assert.equal(canUse("free", "notificationAutomation"), false);
  assert.equal(canUse("pro", "notificationAutomation"), true);
  assert.equal(canUse("free", "advancedReports"), false);
  assert.equal(canUse("pro", "advancedReports"), true);
  assert.equal(getEntitlements("free").reconciliationLimit, 3);

  const { createNotificationJob } = require("./api/lib/notifications");
  const job = createNotificationJob({ templateId: "payment_confirmed", customerName: "김하늘", phone: "01012345678", orderId: "ORDER-101" });
  assert.match(job.jobId, /^notify_/);
  assert.equal(job.status, "PENDING_PROVIDER_DISPATCH");
  assert.ok(job.message.includes("김하늘"));

  const notifRes = createResponse();
  const createJob = require("./api/notifications/create-job");
  createJob({ method: "POST", body: { plan: "free", templateId: "payment_confirmed", customerName: "테스트", phone: "01099998888", orderId: "O-1" } }, notifRes);
  assert.equal(notifRes.statusCode, 402);
  assert.equal(notifRes.body.error, "pro_required");

  console.log("COMMERCIAL_API_SAFETY_CHECK_OK");
}

run().catch((error) => { console.error(error); process.exit(1); });
