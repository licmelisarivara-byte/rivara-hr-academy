import crypto from "crypto";

// Firma del link "Confirmar pago" que le llega a Melisa por mail cuando
// alguien avisa que transfirió: HMAC del id de la compra con ADMIN_SECRET.
// Solo permite confirmar ESA compra; sin la firma correcta no se puede
// abrir ni confirmar nada, aunque se conozca el id.
export function signConfirmToken(id: string): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(`confirmar-pago:${id}`).digest("hex");
}

export function verifyConfirmToken(id: string, token: string): boolean {
  const expected = signConfirmToken(id);
  if (!expected || !token || token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
