import { type NextApiRequest, type NextApiResponse } from 'next';
import { type UploadRequest } from '../common/types';
import { NextResponse, type NextRequest } from 'next/server';
import { SyftRouter } from '../router';

export class NextSyftServer extends SyftRouter {
  async handlePageApi(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    if (req.method === 'POST') {
      const data = JSON.parse(req.body as string) as UploadRequest;
      const forwarded = req.headers['x-forwarded-for'] as string;
      const ip = forwarded != null ? forwarded.split(/, /)[0] : undefined;
      const userAgent = req.headers['user-agent'] as string;
      await this._handleEvents(data, {
        ip,
        userAgent,
        cookies: req.cookies
      });
      res.status(200).json({});
    } else {
      res.status(401);
    }
  }

  async handleAppApi(req: NextRequest): Promise<NextResponse> {
    if (req.method === 'POST') {
      const data = (await req.json()) as UploadRequest;
      await this._handleEvents(data, {
        ip: req.ip,
        userAgent: req.headers.get('user-agent') as string,
        geo: req.geo,
        cookies: req.cookies.getAll().reduce<Record<string, string>>((a, c) => {
          a[c.name] = c.value;
          return a;
        }, {})
      });
      return NextResponse.json({});
    } else {
      return NextResponse.json({ error: 'Unknown method' }, { status: 401 });
    }
  }
}
