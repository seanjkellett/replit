#!/usr/bin/env node

// Build script for Electron production
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🏗️  Building Village for Electron...');
  
  try {
    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    
    // Build client (Vite)
    console.log('📦 Building client with Vite...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Build server (TypeScript to JavaScript)
    console.log('🔧 Compiling server TypeScript...');
    execSync('npx tsc server/index.ts --outDir dist/server --target es2020 --module es2020 --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop', { stdio: 'inherit' });
    
    // Copy necessary files
    console.log('📋 Copying server files...');
    if (fs.existsSync('server')) {
      fs.cpSync('server', 'dist/server', { recursive: true, force: true });
    }
    if (fs.existsSync('shared')) {
      fs.cpSync('shared', 'dist/shared', { recursive: true, force: true });
    }
    
    // Build Electron app
    console.log('🖥️  Building Electron app...');
    execSync('npx electron-builder --config electron-builder.json', { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully!');
    console.log('📁 Check the dist/electron directory for your app.');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();