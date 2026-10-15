import { execSync } from 'child_process';

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
};

/**
 * Robust HTTP client that can fetch web pages using node fetch
 * with curl fallback if local proxy / TLS causes issues in Node.
 */
export async function fetchHtml(url: string, timeoutMs: number = 15000): Promise<string> {
  // First try native fetch
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      return await res.text();
    }
  } catch (err: unknown) {
    // If native fetch failed (e.g. corporate proxy/TLS), use curl fallback
  }

  // Resilient fallback using curl which automatically adheres to Windows system proxy
  try {
    const curlCmd = `curl.exe -s -L -A "${DEFAULT_HEADERS['User-Agent']}" --max-time 15 "${url}"`;
    const output = execSync(curlCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    if (output && output.length > 200) {
      return output;
    }
  } catch (curlErr: unknown) {
    console.error(`Fetch error for ${url}:`, curlErr instanceof Error ? curlErr.message : String(curlErr));
  }

  throw new Error(`Failed to fetch HTML from ${url}`);
}
