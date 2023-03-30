import type { IJsonUploader } from '../types';
import * as https from 'https';
import * as http from 'http';

export default class JsonUploader implements IJsonUploader {
  async upload(url: string, jsonData: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      let httpHandler: any = http;
      const options = {
        method: 'POST',
        path: '/post',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(jsonData, 'utf8')
        }
      };
      if (url.startsWith('https')) {
        httpHandler = https;
      }
      const req = httpHandler.request(url, options, (res) => {
        if (res.statusCode === 200) {
          res.setEncoding('utf8');
          let responseBody = '';
          res.on('data', (chunk) => {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            responseBody += chunk;
          });
          res.on('end', () => {
            resolve(responseBody);
          });
        } else {
          reject(new Error(`Received non-200 status code`));
        }
      });
      req.on('error', (e) => {
        reject(e);
      });
      req.write(jsonData);
      req.end();
    });
  }
}
