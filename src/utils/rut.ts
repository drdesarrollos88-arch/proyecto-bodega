/**
 * Utilidades para formateo y normalización estricta de RUT chileno (XX.XXX.XXX-X).
 */

export function cleanRut(rut: string): string {
  if (!rut) return '';
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatRut(rawRut: string): string {
  if (!rawRut) return '';
  
  const clean = cleanRut(rawRut);
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean;

  const dv = clean.slice(-1);
  const cuerpo = clean.slice(0, -1);

  // Formatear cuerpo con puntos
  let formattedCuerpo = '';
  let count = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    formattedCuerpo = cuerpo[i] + formattedCuerpo;
    count++;
    if (count === 3 && i !== 0) {
      formattedCuerpo = '.' + formattedCuerpo;
      count = 0;
    }
  }

  return `${formattedCuerpo}-${dv}`;
}

export function isValidRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 8 || clean.length > 9) return false;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = '';
  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  else dvCalculado = dvEsperado.toString();

  return dv === dvCalculado;
}
