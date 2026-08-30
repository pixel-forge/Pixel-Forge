import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));

const server = await createServer({
    configFile: false,
    root,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false },
});

try {
    await server.ssrLoadModule('/playground/node.ts');
} finally {
    await server.close();
}
