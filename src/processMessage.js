export async function processMessage(
  topic,
  messageBuffer,
  processEntries,
  onMessage,
) {
  try {
    const message = messageBuffer.toString();
    const payload = JSON.parse(message);
    const entries = processEntries(topic, payload);

    if (entries.length) {
      await onMessage(entries);
    }
  } catch (err) {
    console.error("Error processing message:", err);
  }
}
