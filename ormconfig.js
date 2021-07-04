module.exports = {
  name: 'default',
  type: 'postgres',
  host: 'localhost',
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE_ENV === 'development' ? 'muse-dev' : 'muse',
  synchronize: true,
  logging: true,
  entities: ['src/server/entity/**/*.ts'],
  migrations: ['src/server/migration/**/*.ts'],
  subscribers: ['src/server/subscriber/**/*.ts'],
  cli: {
    entitieDir: 'src/server/entity',
    migrationsDir: 'src/server/migration',
    subscribersDir: 'src/server/subscriber',
  },
};
