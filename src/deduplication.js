const deduplicationCache = new Map();

export function isDuplicate(deviceId, command) {
  // No cache for buttons
  if (deviceId.includes("bouton")) {
    return false;
  }
  const value = JSON.stringify(command);
  if (deduplicationCache.get(deviceId) === value) {
    console.log("Duplicated message ignored:", deviceId);
    return true;
  }
  deduplicationCache.set(deviceId, value);
  return false;
}
