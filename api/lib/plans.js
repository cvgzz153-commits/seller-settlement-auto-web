const PLANS = {
  monthly_auto: {
    id: "monthly_auto",
    amount: 9900,
    currency: "KRW",
    orderName: "SELLERHELP Pro 월 자동결제",
    description: "월 자동결제 Pro 구독 (빌링키 연동 후 자동 청구, 언제든 해지 가능)",
    billingCycle: "monthly",
    requiresBillingKey: true,
  },
  one_time: {
    id: "one_time",
    amount: 990,
    currency: "KRW",
    orderName: "SELLERHELP 1회 정산권",
    description: "비정기 정산 작업을 위한 1회 정산권",
    billingCycle: "one_time",
    requiresBillingKey: false,
  },
};

function getPlan(planId) {
  return PLANS[planId] || null;
}

module.exports = { getPlan, PLANS };
