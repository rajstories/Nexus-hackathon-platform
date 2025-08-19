#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testPath = join(__dirname, '..', 'server', 'db', 'test-connection.ts');

console.log('Testing Azure SQL Database connection...');
const child = spawn('tsx', [testPath], {
  stdio: 'inherit',
  cwd: join(__dirname, '..')
});

child.on('close', (code) => {
  process.exit(code);
});