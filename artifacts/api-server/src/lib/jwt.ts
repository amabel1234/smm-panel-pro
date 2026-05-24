import jwt from "jsonwebtoken";

const SECRET = process.env.SESSION_SECRET ?? "smm-panel-secret-key";

export function signToken(payload: { userId: number; role: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}
