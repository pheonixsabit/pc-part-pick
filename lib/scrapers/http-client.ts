import { spawn } from 'child_process';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const SYSTEM_PROXY =
  process.env.https_proxy ||
  process.env.http_proxy ||
  process.env.HTTPS_PROXY ||
  process.env.HTTP_PROXY ||
  '';

/**
 * Executes an asynchronous non-blocking curl process.
 * Never blocks Node.js event loop and automatically handles proxy/corporate TLS.
 */
function runCurl(url: string, timeoutSec: number = 30): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      '-sS',
      '-L',
      '-k',
      '--connect-timeout',
      '15',
      '--max-time',
      String(timeoutSec),
      '-A',
      DEFAULT_USER_AGENT,
    ];

    if (SYSTEM_PROXY) {
      args.push('--proxy', SYSTEM_PROXY);
    }

    args.push(url);

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
        reject(
          new Error(
            `curl exited with code ${code}: ${stderr.trim() || 'empty response'}`
          )
        );
      }
    });
  });
}

/**
 * Resilient fetch with automatic single retry on network/proxy glitches.
 */
export async function fetchHtml(url: string, timeoutMs: number = 30000): Promise<string> {
  const timeoutSec = Math.max(10, Math.round(timeoutMs / 1000));

  // Attempt 1
  try {
    const html = await runCurl(url, timeoutSec);
    return html;
  } catch (err: unknown) {
    // Retry once with a brief 250ms breathing gap for proxy socket resets
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const html = await runCurl(url, timeoutSec);
      return html;
    } catch (retryErr: unknown) {
      const errMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
      console.error(`Fetch error for ${url}:`, errMsg);
      throw new Error(`Failed to fetch HTML from ${url}: ${errMsg}`);
    }
  }
}
