export async function processMessage(
  topic,
  messageBuffer,
  prepareEntries,
  onMessage,
) {
  try {
    const message = messageBuffer.toString();
    const payload = JSON.parse(message);
    const entries = prepareEntries(topic, payload);

    if (entries.length) {
      await onMessage(entries);
    }
  } catch (err) {
    console.error("Error processing message:", err);
  }
}
