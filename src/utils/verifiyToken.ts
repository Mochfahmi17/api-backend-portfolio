import jwt from "jsonwebtoken";

export default function verifyToken(token: string, secretKeyToken: string) {
  const verifyToken = jwt.verify(token, secretKeyToken);
  return verifyToken;
}
