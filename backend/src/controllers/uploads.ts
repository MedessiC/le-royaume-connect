import { Request, Response } from 'express';
import { uploadToOracleStorage, isOracleConfigured } from '../services/oracleStorage.js';

export async function uploadFile(req: Request, res: Response) {
  try {
    const folder = Array.isArray(req.query.folder) ? req.query.folder[0] : req.query.folder;
    const fileName = Array.isArray(req.query.fileName) ? req.query.fileName[0] : req.query.fileName;
    const contentType = (req.headers['content-type'] as string) || 'application/octet-stream';

    if (!folder || !fileName) {
      return res.status(400).json({ error: 'Missing folder or fileName query parameters.' });
    }

    if (!isOracleConfigured) {
      return res.status(500).json({ error: 'Upload storage is not configured on the server.' });
    }

    const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'No file content received.' });
    }

    const sanitizedFolder = folder
      .replace(/\/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\.{2,}/g, '')
      .replace(/\/+$/, '');

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const objectName = `${sanitizedFolder}/${timestamp}_${sanitizedFileName}`;

    const url = await uploadToOracleStorage(fileBuffer, objectName, contentType);

    res.status(201).json({ url });
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Upload failed';
    res.status(500).json({ error: message });
  }
}
