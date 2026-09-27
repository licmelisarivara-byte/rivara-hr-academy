// Datos de la cuenta de Mercado Pago (CVU), no del banco: así las
// transferencias entran directo a MP y el flujo de "Confirmar pago" puede
// detectarlas automáticamente (ver app/api/confirmar-pago). Antes eran los
// datos de la cuenta de BBVA.
export const bankDetails = {
  holder: "Melisa Rivara",
  cbu: "0000003100039427471216",
  alias: "melisarivara.mp",
  cuil: "27-37993190-7",
};
