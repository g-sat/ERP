// server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Fix for Buffer deprecation warning
if (process.env.NODE_OPTIONS === undefined) {
    process.env.NODE_OPTIONS = '--no-deprecation';
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.NEXT_PUBLIC_PORT;

// When using middleware, you must set the hostname and port
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Parse the URL
            const parsedUrl = parse(req.url, true);

            // Let Next.js handle the request
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('Internal server error');
        }
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
