const deduplicationCache = new Map();

export function isDuplicate(deviceId, entry) {
  // No cache for buttons  or occupancy
  if (deviceId.includes("bouton") || deviceId.includes("presence")) {
    return false;
  }
  const value = JSON.stringify(entry);
  if (deduplicationCache.get(deviceId) === value) {
    console.log("Duplicated message ignored for device:", deviceId);
    return true;
  }
  deduplicationCache.set(deviceId, value);
  return false;
}
