import { spawn } from 'child_process';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Executes a fast, asynchronous non-blocking curl process.
 * This completely avoids blocking the Node.js event loop and automatically
 * respects corporate proxies and Windows system configurations.
 */
function fetchWithCurl(url: string, timeoutSec: number = 25): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      '-s',
      '-L',
      '-k',
      '--connect-timeout',
      '8',
      '--max-time',
      String(timeoutSec),
      '-A',
      DEFAULT_USER_AGENT,
      url,
    ];

    const child = spawn('curl.exe', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf-8');
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8');
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0 && stdout.length > 50) {
        resolve(stdout);
      } else {
        reject(new Error(`curl exited with code ${code}: ${stderr || 'empty response'}`));
      }
    });
  });
}

/**
 * Robust non-blocking HTTP client.
 * Uses native async curl by default on Windows/proxy environments for zero event-loop blocking,
 * and falls back to standard fetch if curl is unavailable.
 */
export async function fetchHtml(url: string, timeoutMs: number = 25000): Promise<string> {
  // Try fast non-blocking async curl first
  try {
    const html = await fetchWithCurl(url, Math.round(timeoutMs / 1000));
    if (html && html.length > 100) {
      return html;
    }
  } catch (curlErr: unknown) {
    // If curl failed, attempt native fetch as fallback
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        return await res.text();
      }
    } catch {
      // Ignore native fetch fallback error
    }

    console.error(`Fetch error for ${url}:`, curlErr instanceof Error ? curlErr.message : String(curlErr));
  }

  throw new Error(`Failed to fetch HTML from ${url}`);
}
