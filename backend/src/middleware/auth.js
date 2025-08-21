import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing token" } });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    return next();
  } catch (e) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid token" } });
  }
}

export function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Login required" } });
    if (req.user.role !== role) return res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient role" } });
    next();
  };
}
