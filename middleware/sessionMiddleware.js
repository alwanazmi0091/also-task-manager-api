import MySQLStoreFactory from "express-mysql-session";
import session from "express-session";
import pool from "../config/db.js";
import "dotenv/config";

const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
  },
  pool,
);

const sessionMiddleware = session({
  name: "sessionId",
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax",
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
});

export default sessionMiddleware;
