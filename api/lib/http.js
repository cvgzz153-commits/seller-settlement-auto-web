function sendJson(res, statusCode, payload) {
  res.status(statusCode).setHeader("Content-Type", "application/json; charset=utf-8");
  res.json(payload);
}

function allowOnly(req, res, method) {
  if (req.method === method) return true;
  res.setHeader("Allow", method);
  sendJson(res, 405, { error: "method_not_allowed", message: `${method} 요청만 지원합니다.` });
  return false;
}

function assertString(value, fieldName, { min = 1, max = 300 } = {}) {
  if (typeof value !== "string") throw new Error(`${fieldName} 값이 필요합니다.`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) throw new Error(`${fieldName} 값 형식이 올바르지 않습니다.`);
  return trimmed;
}

function assertPositiveInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error(`${fieldName} 값은 양의 정수여야 합니다.`);
  return number;
}

module.exports = { allowOnly, assertPositiveInteger, assertString, sendJson };
