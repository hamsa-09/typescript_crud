const jsonServer = require('json-server');
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

// Apply auth middleware
app.rules = auth.rules;
app.use(auth);

// Use default router
app.use(router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`JSON Server with Auth is running on port ${PORT}`);
});
