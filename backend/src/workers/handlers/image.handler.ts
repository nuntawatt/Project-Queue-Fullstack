import { Logger } from '@nestjs/common';

const logger = new Logger('ImageHandler');

export async function imageHandler(
  payload: Record<string, unknown>,
): Promise<void> {
  const { url, operation = 'resize' } = payload as {
    url?: string;
    operation?: string;
  };
  if (!url) throw new Error('Payload missing required field: "url"');

  await sleep(Math.random() * 1500 + 500);

  if (Math.random() < 0.05) throw new Error('Image processor timeout');

  logger.log(`Processed ${url} — operation=${operation}`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
