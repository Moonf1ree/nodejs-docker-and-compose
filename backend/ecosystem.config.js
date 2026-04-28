module.exports = {
  apps: [
    {
      name: 'kupipodariday-backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: Number(process.env.PORT || 4000),
      },
    },
  ],
};
