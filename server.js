const jsonServer = require('json-server');
const bcrypt = require('bcryptjs');

// Monkey-patch bcryptjs to disable hashing and use plain text
bcrypt.hash = (data, salt, cb) => {
  if (typeof salt === 'function') { cb = salt; }
  if (cb) cb(null, data);
  return Promise.resolve(data);
};
bcrypt.compare = (data, encrypted, cb) => {
  const result = data === encrypted;
  if (cb) cb(null, result);
  return Promise.resolve(result);
};
bcrypt.hashSync = (data) => data;
bcrypt.compareSync = (data, encrypted) => data === encrypted;

const auth = require('json-server-auth');
const cors = require('cors');
const path = require('path');

const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Bind the router db to the app
app.db = router.db;

// Apply CORS
app.use(cors());

// Apply default middlewares (logger, static, etc)
app.use(middlewares);

// Custom middleware to block listing all users
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path === '/users') {
    return res.status(403).json({ error: 'Access denied: listing users is restricted' });
  }
  next();
});

// Apply auth rules
const rules = auth.rewriter({
  "users": 600,
  "posts": 664,
  "likes": 664,
  "bookmarks": 664,
  "flags": 660
});
app.use(rules);
app.use(auth);

// Use default router
app.use(router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`JSON Server with Auth is running on port ${PORT}`);
});
