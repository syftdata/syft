import type { IJsonUploader } from '../types';

export default class JsonUploader implements IJsonUploader {
  async upload(url: string, jsonData: string): Promise<string> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  }
}
