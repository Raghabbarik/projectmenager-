import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

function smtpDevPlugin() {
  return {
    name: 'smtp-dev-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/send-email' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk: any) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { handleSendEmailRequest } = await import('./api/send-email.ts');
              const result = await handleSendEmailRequest(body);
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              let msg = err.message || 'SMTP error occurred';
              if (
                msg.includes('Invalid login') ||
                msg.includes('535-5.7.8') ||
                msg.includes('535 5.7.8') ||
                msg.includes('BadCredentials') ||
                msg.includes('Username and Password not accepted')
              ) {
                msg =
                  'Authentication failed: Invalid email or App Password. If using Gmail, make sure 2-Step Verification is active and generate a 16-character "App Password" from your Google Account Security settings (your standard Google account password will not work).';
              }
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: msg }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), smtpDevPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1600,
    },
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
