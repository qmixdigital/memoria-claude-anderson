// PM2 — configuração de processo (VPS clinicas-vps / HestiaCP)
// Uso: HOME=/root PM2_HOME=/root/.pm2 pm2 start ecosystem.config.js
//
// Reflete o deploy REAL em produção (conferido 2026-06-10):
//   - cwd:  /home/user/web/desentupidora.pro/app  (dir web do HestiaCP, NÃO /var/www)
//   - PORT: 3008  (Nginx do Hestia faz proxy desentupidora.pro -> 127.0.0.1:3008)
//   - start: next start -p 3008  (pnpm/next; o app builda em .next no próprio dir)

module.exports = {
  apps: [
    {
      name: "desentupidora-pro",
      cwd: "/home/user/web/desentupidora.pro/app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3008",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3008,
      },
      max_memory_restart: "512M",
      error_file: "/root/.pm2/logs/desentupidora-pro-error.log",
      out_file: "/root/.pm2/logs/desentupidora-pro-out.log",
      merge_logs: true,
      time: true,
    },
  ],
}
