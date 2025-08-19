#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migratePath = join(__dirname, '..', 'server', 'db', 'migrate.ts');

console.log('Running SQL migrations...');
const child = spawn('tsx', [migratePath], {
  stdio: 'inherit',
  cwd: join(__dirname, '..')
});

child.on('close', (code) => {
  process.exit(code);
});