import 'dotenv/config';

const driver = process.env.DB_DRIVER || 'sqlite';

const config = {
  sqlite: {
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: { filename: process.env.SQLITE_PATH || '/app/data/despensa.sqlite' },
    migrations: { directory: './migrations' }
  },
  postgres: {
    client: 'pg',
    connection: {
      host: process.env.PGHOST,
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE
    },
    migrations: { directory: './src/migrations' }
  }
};

export default config[driver];
