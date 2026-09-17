module.exports = {
  apps: [
    {
      name: "agenda-telegram",
      script: "dist/index.js",
      cwd: "/var/www/agenda-telegram",
      node_args: "--env-file=.env",
      instances: 1,
      exec_mode: "fork",
      kill_timeout: 6000,
      autorestart: true,
      max_memory_restart: "300M",
      env: { NODE_ENV: "production" },
    },
  ],
};
