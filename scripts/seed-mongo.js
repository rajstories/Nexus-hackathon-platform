#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedPath = join(__dirname, '..', 'server', 'db', 'seed-mongo.ts');

console.log('Running MongoDB seeding...');
const child = spawn('tsx', [seedPath], {
  stdio: 'inherit',
  cwd: join(__dirname, '..')
});

child.on('close', (code) => {
  process.exit(code);
});