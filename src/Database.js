import mongoose from 'mongoose';
import 'dotenv/config';

const url = process.env.MONGODB_URL;
const dbname = process.env.DB_NAME;
const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const auth = process.env.DB_AUTH;

const mongostring = `mongodb://${url}/${dbname}`;

export class Database {
  conn;

  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect(mongostring, {
      authSource: auth,
      user,
      pass
    });

    this.conn = mongoose.connection;

    this.conn.on('error', console.error.bind("Connection Error: "));
    this.conn.once('open', () => {
      console.log(`Connected to db: ${dbname}`);
    })
  }

  disconnect() {
    this.conn.close();
  }

  reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000)
  }

}

