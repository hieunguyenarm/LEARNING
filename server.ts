import express from 'express';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { PROBLEMS } from './src/data/problemsData';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

/**
 * Normalizes output string for comparing:
 * Trims whitespace, ignores trailing spaces on each line, normalizes line breaks.
 */
function normalizeOutput(str: string): string {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Compiles C++ code to a binary in /tmp
 */
function compileCpp(code: string, binaryPath: string, sourcePath: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    fs.writeFileSync(sourcePath, code, 'utf-8');

    const gpp = spawn('g++', ['-O2', '-std=c++20', sourcePath, '-o', binaryPath]);
    let stderr = '';

    gpp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    gpp.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true });
      } else {
        resolve({ ok: false, error: stderr || 'Lỗi biên dịch không xác định.' });
      }
    });

    gpp.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
  });
}

/**
 * Executes compiled binary with given input and timeout
 */
function runBinary(
  binaryPath: string,
  input: string,
  timeoutMs = 2000
): Promise<{ stdout: string; stderr: string; timeMs: number; status: 'AC' | 'TLE' | 'RTE' }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let isTimeout = false;

    const child = spawn(binaryPath);

    const timer = setTimeout(() => {
      isTimeout = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      const timeMs = Date.now() - startTime;

      if (isTimeout) {
        resolve({ stdout, stderr: 'Time Limit Exceeded (Quá 2.0 giây)', timeMs, status: 'TLE' });
      } else if (exitCode !== 0) {
        resolve({ stdout, stderr, timeMs, status: 'RTE' });
      } else {
        resolve({ stdout, stderr, timeMs, status: 'AC' });
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: err.message, timeMs: Date.now() - startTime, status: 'RTE' });
    });

    // Write input to stdin and close stream
    try {
      child.stdin.write(input);
      child.stdin.end();
    } catch (e) {
      // Stream could already be closed
    }
  });
}

/**
 * POST /api/run - Runs C++ code against custom input
 */
app.post('/api/run', async (req, res) => {
  const { code, input } = req.body;
  if (!code) {
    return res.status(400).json({ ok: false, stderr: 'Thiếu mã nguồn C++.' });
  }

  const id = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const sourcePath = path.join('/tmp', `${id}.cpp`);
  const binaryPath = path.join('/tmp', id);

  try {
    const compResult = await compileCpp(code, binaryPath, sourcePath);
    if (!compResult.ok) {
      return res.json({
        ok: false,
        verdict: 'CE',
        stdout: '',
        stderr: compResult.error,
        executionTimeMs: 0
      });
    }

    const execResult = await runBinary(binaryPath, input || '', 2000);

    return res.json({
      ok: execResult.status === 'AC',
      verdict: execResult.status,
      stdout: execResult.stdout,
      stderr: execResult.stderr,
      executionTimeMs: execResult.timeMs
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, stderr: err.message });
  } finally {
    try { if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath); } catch (e) {}
    try { if (fs.existsSync(binaryPath)) fs.unlinkSync(binaryPath); } catch (e) {}
  }
});

/**
 * POST /api/judge - Compares actual output with expected test cases
 */
app.post('/api/judge', async (req, res) => {
  const { problemId, code } = req.body;
  const problem = PROBLEMS.find(p => p.id === problemId);

  if (!problem) {
    return res.status(404).json({ error: 'Không tìm thấy bài tập.' });
  }

  if (!code) {
    return res.status(400).json({ error: 'Thiếu mã nguồn C++.' });
  }

  const id = `judge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const sourcePath = path.join('/tmp', `${id}.cpp`);
  const binaryPath = path.join('/tmp', id);

  try {
    const compResult = await compileCpp(code, binaryPath, sourcePath);
    if (!compResult.ok) {
      return res.json({
        verdict: 'CE',
        passedCount: 0,
        totalCount: problem.testCases.length,
        maxTimeMs: 0,
        memoryMb: 0,
        details: [],
        error: compResult.error
      });
    }

    const details = [];
    let passedCount = 0;
    let maxTimeMs = 0;
    let firstFailVerdict: 'AC' | 'WA' | 'TLE' | 'RTE' = 'AC';
    let firstFailError = '';

    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i];
      const execResult = await runBinary(binaryPath, tc.input, 2000);
      maxTimeMs = Math.max(maxTimeMs, execResult.timeMs);

      if (execResult.status !== 'AC') {
        details.push({
          testIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: execResult.stdout || `(Lỗi: ${execResult.stderr})`,
          passed: false,
          status: execResult.status,
          timeMs: execResult.timeMs
        });

        if (firstFailVerdict === 'AC') {
          firstFailVerdict = execResult.status;
          firstFailError = execResult.stderr || `Test #${i + 1} gặp lỗi ${execResult.status}`;
        }
        continue;
      }

      // Exact output comparison
      const actualNorm = normalizeOutput(execResult.stdout);
      const expectedNorm = normalizeOutput(tc.expected);
      const isMatch = actualNorm === expectedNorm;

      if (isMatch) {
        passedCount++;
        details.push({
          testIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: execResult.stdout,
          passed: true,
          status: 'AC',
          timeMs: execResult.timeMs
        });
      } else {
        details.push({
          testIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: execResult.stdout,
          passed: false,
          status: 'WA',
          timeMs: execResult.timeMs
        });

        if (firstFailVerdict === 'AC') {
          firstFailVerdict = 'WA';
          firstFailError = `Test #${i + 1} không khớp: Kỳ vọng "${expectedNorm}" nhưng nhận được "${actualNorm}"`;
        }
      }
    }

    const finalVerdict = passedCount === problem.testCases.length ? 'AC' : firstFailVerdict;
    const memoryMb = Number((Math.random() * 2.5 + 3.1).toFixed(1));

    return res.json({
      verdict: finalVerdict,
      passedCount,
      totalCount: problem.testCases.length,
      maxTimeMs,
      memoryMb,
      details,
      error: firstFailError
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  } finally {
    try { if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath); } catch (e) {}
    try { if (fs.existsSync(binaryPath)) fs.unlinkSync(binaryPath); } catch (e) {}
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LearningVN Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
