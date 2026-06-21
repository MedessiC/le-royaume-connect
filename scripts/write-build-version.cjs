#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '..', 'public', 'version.txt');
const deployVersion =
  process.env.COMMIT_REF ||
  process.env.NETLIFY_DEPLOY_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  Date.now().toString();

fs.writeFileSync(versionFile, `${deployVersion}\n`);
console.log(`Build version: ${deployVersion}`);
