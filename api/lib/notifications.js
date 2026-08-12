const { randomUUID } = require("crypto");

const TEMPLATES = {
  payment_confirmed: {
    channel: "alimtalk",
    title: "입금 확인 안내",
    body: "#{고객명}님, 입금이 정상적으로 확인되었습니다. 상품은 준비되는 대로 순차 출고해 드리겠습니다.",
    requiredVariables: ["customerName"],
  },
  shipping_started: {
    channel: "alimtalk",
    title: "배송 시작 안내",
    body: "#{고객명}님, 주문하신 상품이 오늘 출고되었습니다. 배송 상황은 택배사 조회를 통해 확인하실 수 있습니다.",
    requiredVariables: ["customerName"],
  },
};

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!/^01\d{8,9}$/.test(digits)) return null;
  return digits;
}

function renderTemplate(templateId, variables) {
  const template = TEMPLATES[templateId];
  if (!template) throw new Error("지원하지 않는 알림 템플릿입니다.");
  for (const field of template.requiredVariables) {
    if (!String(variables?.[field] || "").trim()) throw new Error(`${field} 값이 필요합니다.`);
  }
  const message = template.body.replace(/#\{고객명\}/g, String(variables.customerName).trim());
  return { ...template, message };
}

function createNotificationJob({ templateId, customerName, phone, orderId }) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) throw new Error("유효한 휴대폰 번호가 필요합니다.");
  const rendered = renderTemplate(templateId, { customerName });
  return {
    jobId: `notify_${randomUUID()}`,
    templateId,
    channel: rendered.channel,
    title: rendered.title,
    message: rendered.message,
    recipient: { customerName: String(customerName).trim(), phone: normalizedPhone },
    orderId: String(orderId || "").trim(),
    status: "PENDING_PROVIDER_DISPATCH",
  };
}

module.exports = { TEMPLATES, createNotificationJob, renderTemplate };
