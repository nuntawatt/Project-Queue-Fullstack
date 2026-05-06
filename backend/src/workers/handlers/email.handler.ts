import { Logger } from '@nestjs/common';

const logger = new Logger('EmailHandler');

export async function emailHandler(
  payload: Record<string, unknown>,
): Promise<void> {
  const { to } = payload as { to?: string };
  if (!to) throw new Error('Payload missing required field: "to"');

  await sleep(Math.random() * 800 + 200);

  if (Math.random() < 0.1)
    throw new Error('Email service temporarily unavailable');

  logger.log(`Sent to ${to}`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
