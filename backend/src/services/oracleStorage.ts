import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ORACLE_REGION = process.env.ORACLE_REGION;
const ORACLE_TENANCY_ID = process.env.ORACLE_TENANCY_ID;
const ORACLE_USER_ID = process.env.ORACLE_USER_ID;
const ORACLE_FINGERPRINT = process.env.ORACLE_FINGERPRINT;
const ORACLE_NAMESPACE = process.env.ORACLE_NAMESPACE;
const ORACLE_BUCKET = process.env.ORACLE_BUCKET;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const ORACLE_PRIVATE_KEY_PATH = process.env.ORACLE_PRIVATE_KEY_PATH;

export const isOracleConfigured = Boolean(
  ORACLE_REGION &&
  ORACLE_TENANCY_ID &&
  ORACLE_USER_ID &&
  ORACLE_FINGERPRINT &&
  ORACLE_NAMESPACE &&
  ORACLE_BUCKET &&
  (ORACLE_PRIVATE_KEY || ORACLE_PRIVATE_KEY_PATH)
);

function getPrivateKey(): string {
  if (ORACLE_PRIVATE_KEY) {
    return ORACLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  if (ORACLE_PRIVATE_KEY_PATH) {
    const resolvedPath = path.resolve(ORACLE_PRIVATE_KEY_PATH);
    return fs.readFileSync(resolvedPath, 'utf8');
  }

  throw new Error('Oracle private key is missing. Set ORACLE_PRIVATE_KEY or ORACLE_PRIVATE_KEY_PATH.');
}

function getHost(): string {
  if (!ORACLE_REGION) {
    throw new Error('ORACLE_REGION is not configured.');
  }
  return `objectstorage.${ORACLE_REGION}.oraclecloud.com`;
}

function getKeyId(): string {
  if (!ORACLE_TENANCY_ID || !ORACLE_USER_ID || !ORACLE_FINGERPRINT) {
    throw new Error('ORACLE_TENANCY_ID, ORACLE_USER_ID or ORACLE_FINGERPRINT is not configured.');
  }
  return `${ORACLE_TENANCY_ID}/${ORACLE_USER_ID}/${ORACLE_FINGERPRINT}`;
}

export async function uploadToOracleStorage(
  fileBuffer: Buffer,
  objectName: string,
  contentType: string
) {
  if (!isOracleConfigured) {
    throw new Error('Oracle Object Storage is not configured. Set ORACLE_* env variables.');
  }

  if (!ORACLE_NAMESPACE || !ORACLE_BUCKET) {
    throw new Error('ORACLE_NAMESPACE or ORACLE_BUCKET is not configured.');
  }

  const host = getHost();
  const encodedObjectName = encodeURIComponent(objectName);
  const objectPath = `/n/${ORACLE_NAMESPACE}/b/${ORACLE_BUCKET}/o/${encodedObjectName}`;
  const url = `https://${host}${objectPath}`;
  const date = new Date().toUTCString();
  const contentLength = fileBuffer.length.toString();
  const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('base64');

  const signingString = [
    `(request-target): put ${objectPath}`,
    `host: ${host}`,
    `date: ${date}`,
    `content-type: ${contentType}`,
    `content-length: ${contentLength}`,
    `x-content-sha256: ${sha256}`,
  ].join('\n');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingString);
  signer.end();

  const privateKey = getPrivateKey();
  const signature = signer.sign(privateKey, 'base64');
  const authorization = `Signature version="1",keyId="${getKeyId()}",algorithm="rsa-sha256",headers="(request-target) host date content-type content-length x-content-sha256",signature="${signature}"`;

  const headers = {
    host,
    date,
    'content-type': contentType,
    'content-length': contentLength,
    'x-content-sha256': sha256,
    authorization,
  };

  const response = await axios.put(url, fileBuffer, {
    headers,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  if (!response || (response.status !== 200 && response.status !== 201)) {
    throw new Error(`Oracle Object Storage upload failed with status ${response.status}`);
  }

  return `https://${host}/n/${ORACLE_NAMESPACE}/b/${ORACLE_BUCKET}/o/${encodedObjectName}`;
}
