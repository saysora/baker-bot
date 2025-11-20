import 'dotenv/config';
import {drizzle} from 'drizzle-orm/libsql';
import schema from './schema';

const db = drizzle(process.env.DB_FILENAME!, {
  schema,
});

export default db;
