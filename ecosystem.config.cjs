module.exports = {
  apps: [{
    name: 'pilot-3d-pfd',
    cwd: '/root/projects-ex/Pilot_3d_PFD',
    script: 'npm',
    args: 'run dev',
    env: {
      DISABLE_HMR: 'true',
      PORT: '3410',
      UDP_PORT: '14443',
    },
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 3000,
  }]
};
