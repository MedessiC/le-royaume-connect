#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the argument (major, minor, patch) or default to patch
const bumpType = process.argv[2] || 'patch';

// Path to version.txt
const versionFile = path.join(__dirname, '..', 'public', 'version.txt');

// Read current version
let version = fs.readFileSync(versionFile, 'utf8').trim();
console.log(`Current version: ${version}`);

// Parse version
const parts = version.split('.').map(Number);
if (parts.length !== 3) {
  console.error('Invalid version format. Expected MAJOR.MINOR.PATCH');
  process.exit(1);
}

// Bump version
switch (bumpType) {
  case 'major':
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
    break;
  case 'minor':
    parts[1]++;
    parts[2] = 0;
    break;
  case 'patch':
    parts[2]++;
    break;
  default:
    console.error(`Invalid bump type: ${bumpType}. Use 'major', 'minor', or 'patch'`);
    process.exit(1);
}

const newVersion = parts.join('.');

// Write new version
fs.writeFileSync(versionFile, newVersion + '\n');
console.log(`Updated version to: ${newVersion}`);
console.log(`File: ${versionFile}`);
