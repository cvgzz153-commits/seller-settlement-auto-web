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
  createOrder({ method: "POST", body: { planId: "monthly" } }, orderRes);
  assert.equal(orderRes.statusCode, 200);
  assert.equal(orderRes.body.amount, 4900);
  assert.equal(orderRes.body.planId, "monthly");
  assert.match(orderRes.body.orderId, /^settle_[A-Za-z0-9]+$/);

  const invalidPlanRes = createResponse();
  createOrder({ method: "POST", body: { planId: "unknown" } }, invalidPlanRes);
  assert.equal(invalidPlanRes.statusCode, 400);

  const confirmRes = createResponse();
  await confirm({ method: "POST", body: { paymentKey: "payment", orderId: "settle_123456", amount: 990 } }, confirmRes);
  assert.equal(confirmRes.statusCode, 503);
  assert.equal(confirmRes.body.error, "payments_not_enabled");

  const webhookRes = createResponse();
  await webhook({ method: "POST", body: { eventType: "PAYMENT_STATUS_CHANGED", data: { paymentKey: "test" } } }, webhookRes);
  assert.equal(webhookRes.statusCode, 200);
  assert.equal(webhookRes.body.received, true);

  console.log("COMMERCIAL_API_SAFETY_CHECK_OK");
}

run().catch((error) => { console.error(error); process.exit(1); });
