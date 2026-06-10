module.exports = {
  apps: [
    {
      name: 'pilot-3d-pfd',
      cwd: '/root/projects-ex/Pilot_3d_PFD',
      script: 'node',
      args: 'server/server.js',
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
    },
  ]
};
