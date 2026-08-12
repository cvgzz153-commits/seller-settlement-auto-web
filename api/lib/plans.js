const PLANS = {
  season_pass: {
    id: "season_pass",
    amount: 990,
    currency: "KRW",
    orderName: "정산메이트 공구 시즌 이용권",
    description: "공구 오픈 시즌 1회 이용권",
  },
  monthly: {
    id: "monthly",
    amount: 4900,
    currency: "KRW",
    orderName: "정산메이트 월간 이용권",
    description: "월간 이용권 (반복 결제 기능은 별도 빌링키 흐름 연결 필요)",
  },
};

function getPlan(planId) {
  return PLANS[planId] || null;
}

module.exports = { getPlan, PLANS };
