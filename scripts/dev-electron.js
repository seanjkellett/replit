#!/usr/bin/env node

// Development script for running Electron with the dev server
const { spawn } = require('child_process');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

async function main() {
  console.log('🚀 Starting Village Electron Development Mode...');
  
  // Set development environment
  process.env.NODE_ENV = 'development';
  
  // Start the dev server
  console.log('📦 Starting Vite dev server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Wait for dev server to be ready
  console.log('⏳ Waiting for dev server to be ready...');
  await sleep(5000); // Give Vite time to start
  
  // Start Electron
  console.log('🖥️  Starting Electron...');
  const electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });
  
  // Handle cleanup
  const cleanup = () => {
    console.log('\n🔄 Shutting down...');
    devServer.kill();
    electronProcess.kill();
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  electronProcess.on('close', (code) => {
    console.log(`\n🛑 Electron exited with code ${code}`);
    devServer.kill();
    process.exit(code);
  });
}

main().catch(console.error);