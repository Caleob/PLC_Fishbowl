import { NextRequest } from 'next/server';
import { spawn } from 'child_process';

export const runtime = 'nodejs';

interface GemmaRequest {
  messages: { role: string; content: string }[];
  modelId?: string;
  stream?: boolean;
}

const MAX_BODY_SIZE = 100_000;
const MAX_MESSAGES = 64;
const MAX_MESSAGE_CHARS = 20_000;
const MAX_TOTAL_MESSAGE_CHARS = 80_000;
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant']);
const ALLOWED_MODELS = new Set(['gemma-4']);

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function sanitizeError(message: string): string {
  return message
    .replace(/\/Users\/[^/\s]+/g, '/Users/***');
}

function hasTrustedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');

  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function getHostname(req: NextRequest): string | null {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!host) return null;

  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return null;
  }
}

function isLocalOrPrivateHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (normalized === 'localhost' || normalized === '::1' || normalized.endsWith('.local')) {
    return true;
  }

  if (/^127(?:\.\d{1,3}){3}$/.test(normalized)) {
    return true;
  }

  if (/^10(?:\.\d{1,3}){3}$/.test(normalized)) {
    return true;
  }

  if (/^192\.168(?:\.\d{1,3}){2}$/.test(normalized)) {
    return true;
  }

  const match = normalized.match(/^172\.(\d{1,3})(?:\.\d{1,3}){2}$/);
  if (match) {
    const secondOctet = parseInt(match[1], 10);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
}

function validateMessages(messages: unknown): messages is { role: string; content: string }[] {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return false;
  }

  let totalChars = 0;

  for (const message of messages) {
    if (!message || typeof message !== 'object') return false;
    const role = 'role' in message ? message.role : undefined;
    const content = 'content' in message ? message.content : undefined;

    if (typeof role !== 'string' || !ALLOWED_ROLES.has(role)) return false;
    if (typeof content !== 'string' || content.length === 0 || content.length > MAX_MESSAGE_CHARS) return false;

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_MESSAGE_CHARS) return false;
  }

  return true;
}

export async function POST(req: NextRequest) {
  if ((process.env.NEXT_PUBLIC_HOSTED_MODE === 'true') || process.env.VERCEL === '1') {
    return jsonError('Gemma Local is disabled in hosted deployments.', 403);
  }

  const hostname = getHostname(req);
  const allowRemoteGemma = process.env.ALLOW_REMOTE_GEMMA === 'true';
  if (!hostname || (!isLocalOrPrivateHostname(hostname) && !allowRemoteGemma)) {
    return jsonError(
      'Gemma Local is only available on localhost or a private network. Set ALLOW_REMOTE_GEMMA=true to override.',
      403,
    );
  }

  if (!hasTrustedOrigin(req)) {
    return jsonError('Cross-origin requests are not allowed.', 403);
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return jsonError('Request too large.', 413);
  }

  let body: GemmaRequest;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON.', 400);
  }

  const { messages, modelId = 'gemma-4', stream = true } = body;

  if (!validateMessages(messages)) {
    return jsonError('Messages must be a non-empty, valid conversation payload.', 400);
  }

  const prompt = buildPrompt(messages);

  try {
    if (stream) {
      return streamResponse(prompt, modelId);
    } else {
      return await generateResponse(prompt, modelId);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Gemma Local API Error]', message);
    return jsonError(sanitizeError(message), 500);
  }
}

function buildPrompt(messages: { role: string; content: string }[]): string {
  const parts: string[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      parts.push(`<system>\n${msg.content}\n</system>\n`);
    } else if (msg.role === 'user') {
      parts.push(`User: ${msg.content}\n`);
    } else if (msg.role === 'assistant') {
      parts.push(`Assistant: ${msg.content}\n`);
    }
  }

  return parts.join('\n');
}

function streamResponse(prompt: string, model: string): Response {
  const encoder = new TextEncoder();
  let wordCount = 0;

  const readableStream = new ReadableStream({
    start(controller) {
      // Modify args below as needed to match the local gemma CLI/ollama integration.
      // By default we spawn the local "gemma" CLI interface.
      const args = [
        'run',
        '--model', model,
        '--prompt', prompt,
      ];

      const proc = spawn('gemma', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      });

      let stderrOutput = '';
      let jsonBuffer = '';

      proc.stdout.on('data', (data: Buffer) => {
        // Handle stream data from gemma command.
        // Assuming gemma CLI outputs words/tokens incrementally on stdout.
        const chunkText = data.toString();
        if (chunkText) {
          const event = `data: ${JSON.stringify({ type: 'text', text: chunkText })}\n\n`;
          controller.enqueue(encoder.encode(event));
          wordCount += chunkText.split(/\s+/).filter(Boolean).length;
        }
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderrOutput += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0 && wordCount === 0) {
          const safeError = sanitizeError(stderrOutput || `exit code ${code}`);
          const errorEvent = `data: ${JSON.stringify({ type: 'text', text: `[Gemma local error: ${safeError}]` })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        }

        const estimatedOutput = Math.round(wordCount * 1.3);
        const usageEvent = `data: ${JSON.stringify({ type: 'usage', inputTokens: 0, outputTokens: estimatedOutput })}\n\n`;
        controller.enqueue(encoder.encode(usageEvent));

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      });

      proc.on('error', (err) => {
        const errorEvent = `data: ${JSON.stringify({
          type: 'text',
          text: `[Gemma command not found. Ensure \`gemma\` CLI is installed and configured locally.]`,
        })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      });
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
    },
  });
}

async function generateResponse(prompt: string, model: string): Promise<Response> {
  return new Promise((resolve) => {
    const args = ['run', '--model', model, '--prompt', prompt];
    const proc = spawn('gemma', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        resolve(jsonError(sanitizeError(stderr || `gemma exited with code ${code}`), 500));
        return;
      }

      const text = stdout.trim();
      resolve(new Response(
        JSON.stringify({ text, usage: { inputTokens: 0, outputTokens: Math.round(text.split(/\s+/).length * 1.3) } }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        },
      ));
    });

    proc.on('error', () => {
      resolve(jsonError('Gemma local CLI not found.', 500));
    });
  });
}
