export type byte = number & { __brand: 'byte' };

export function toByte(value: number | byte): byte {
  if (value < 0 || value > 255 || Math.floor(value) !== value) {
    throw new Error(
      'El valor debe ser un número entero entre 0 y 255, inclusive.',
    );
  }
  return value as byte;
}

export const byte = {
  MAX_VALUE: 127,
};
