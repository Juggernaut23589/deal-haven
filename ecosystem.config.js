// PM2 process definitions for the single-VM (Contabo, 8GB RAM) deployment.
// Referenced by .github/workflows/deploy.yml from within backend/ and frontend/
// as `../ecosystem.config.js`.
//
// Memory ceilings sized for 8GB total RAM shared with PostgreSQL + Redis on the
// same box (see infra/scripts/setup-server.sh for their tuning). The previous
// 400M ceiling (sized for a 1GB Oracle VM) was too tight — Sharp image
// processing during multi-photo listing uploads could exceed it and force a
// mid-request restart.
module.exports = {
  apps: [
    {
      name: 'ashimarket-api',
      cwd: '/home/deploy/ashimarket/backend',
      script: 'dist/index.js',
      max_memory_restart: '1500M',
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'ashimarket-web',
      cwd: '/home/deploy/ashimarket/frontend',
      script: 'npm',
      args: 'start',
      max_memory_restart: '1000M',
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      env: { NODE_ENV: 'production' },
    },
  ],
};
