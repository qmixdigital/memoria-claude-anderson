// PM2: processo unico do conector. Bun executa o index.ts direto.
module.exports = {
  apps: [
    {
      name: "wp-mcp",
      script: "src/index.ts",
      interpreter: process.env.HOME + "/.bun/bin/bun",
      cwd: "/opt/wp-mcp",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "400M",
      kill_timeout: 8000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
