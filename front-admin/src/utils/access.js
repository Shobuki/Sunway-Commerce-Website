// src/utils/access.js
export function hasMenuAccess(menuAccess) {
  return menuAccess?.Access === "WRITE";
}
export function hasFeatureAccess(menuAccess, feature) {
  return (
    menuAccess?.Features?.some(
      (f) => f.Feature === feature && f.Access === "WRITE"
    ) ?? false
  );
}
