import * as http from 'http';
import { logInfo } from '../utils';
import { type AST } from '../codegen/types';

const PORT = 8085;
export function startServer(getAST: () => AST | undefined): http.Server {
  const server = http
    .createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const ast = getAST();
      if (ast == null) {
        res.end('{}');
        return;
      }
      res.end(
        JSON.stringify({
          schemas: ast.eventSchemas,
          config: ast.config
        })
      );
    })
    .listen(PORT);
  logInfo(`AST Json Server is running at:  127.0.0.1:${PORT}`);
  return server;
}
