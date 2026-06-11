module.exports = {
  apps: [
    {
      name: 'pilot-3d-pfd',
      cwd: '/root/projects-ex/Pilot_3d_PFD',
      script: './node_modules/.bin/vite',
      args: '--host 0.0.0.0 --port 3410',
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
    },
  ],
};
