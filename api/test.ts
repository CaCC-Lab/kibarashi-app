import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'success',
    message: 'Root level API test working',
    timestamp: new Date().toISOString(),
    path: req.url
  });
}