const FREE_RECONCILIATION_LIMIT = 3;

const ENTITLEMENTS = {
  free: {
    reconciliationLimit: FREE_RECONCILIATION_LIMIT,
    notificationAutomation: false,
    advancedReports: false,
  },
  pro: {
    reconciliationLimit: Number.POSITIVE_INFINITY,
    notificationAutomation: true,
    advancedReports: true,
  },
};

function getEntitlements(plan = "free") {
  return ENTITLEMENTS[plan] || ENTITLEMENTS.free;
}

function canUse(plan, feature) {
  return Boolean(getEntitlements(plan)[feature]);
}

module.exports = { FREE_RECONCILIATION_LIMIT, canUse, getEntitlements };
