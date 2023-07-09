import {
  ADD,
  IFNZ,
  LOD,
  LODV,
  NOP,
  STR,
  SUB,
  SWAP,
  WHNZ,
} from '../src/domain/instruction';
import { MicroProcessorImpl } from '../src/domain/microprocessor';

describe('dado un microprocesador', () => {
  it('ejecuta correctamente el programa NOP', () => {
    const micro = new MicroProcessorImpl();
    micro.run([new NOP(), new NOP(), new NOP()]);
    expect(micro.programCounter).toBe(3);
  });

  it('Hace un SWAP correctamente', () => {
    const micro = new MicroProcessorImpl();
    micro.run([new LODV(10), new SWAP()]);
    expect(micro.programCounter).toBe(2);
    expect(micro.aAcumulator).toBe(0);
    expect(micro.bAcumulator).toBe(10);
  });

  it('ejecuta correctamente una suma chica', () => {
    const micro = new MicroProcessorImpl();
    micro.run([new LODV(10), new SWAP(), new LODV(22), new ADD()]);
    expect(micro.programCounter).toBe(4);
    expect(micro.aAcumulator).toBe(32);
    expect(micro.bAcumulator).toBe(0);
  });

  it('ejecuta correctamente una suma grande', () => {
    const micro = new MicroProcessorImpl();
    micro.run([new LODV(120), new SWAP(), new LODV(15), new ADD()]);
    expect(micro.programCounter).toBe(4);
    expect(micro.aAcumulator).toBe(127);
    expect(micro.bAcumulator).toBe(8);
  });

  it('podemos deshacer la instrucción SWAP', () => {
    const micro = new MicroProcessorImpl();
    const swap = new SWAP();
    micro.run([new LODV(25), swap]);
    expect(micro.programCounter).toBe(2);
    expect(micro.aAcumulator).toBe(0);
    expect(micro.bAcumulator).toBe(25);
    swap.undo(micro);
    expect(micro.programCounter).toBe(1);
    expect(micro.aAcumulator).toBe(25);
    expect(micro.bAcumulator).toBe(0);
  });

  it('ejecuta correctamente un programa con IFNZ - rama true', () => {
    const micro = new MicroProcessorImpl();
    micro.run([
      new LODV(15),
      new SWAP(),
      new LODV(26),
      new IFNZ([new ADD(), new SWAP()]),
    ]);
    expect(micro.programCounter).toBe(6);
    expect(micro.aAcumulator).toBe(0);
    expect(micro.bAcumulator).toBe(41);
  });

  it('ejecuta correctamente un programa con IFNZ - rama false', () => {
    const micro = new MicroProcessorImpl();
    micro.run([new LODV(10), new SWAP(), new IFNZ([new SWAP()])]);
    expect(micro.programCounter).toBe(3);
    expect(micro.aAcumulator).toBe(0);
    expect(micro.bAcumulator).toBe(10);
  });

  it('ejecuta correctamente un programa con WHNZ que suma los primeros 4 números', () => {
    const micro = new MicroProcessorImpl();
    micro.run([
      // Total en address 1
      new LODV(0),
      new STR(1),
      // Indice se guardará en address 0
      new LODV(4),
      new WHNZ([
        // Total = Total + Indice y queda en address 1
        new STR(0),
        new SWAP(),
        new LOD(1),
        new ADD(),
        new STR(1),
        //
        // Resto 1 a i
        new LODV(1),
        new SWAP(),
        new LOD(0), // recupero el valor del índice
        new SUB(),
      ]),
      new LOD(1), // deja el total en el acumulador A
    ]);
    expect(micro.aAcumulator).toBe(10);
    expect(micro.bAcumulator).toBe(0);
    micro.reset();
    expect(micro.programCounter).toBe(0);
    expect(micro.aAcumulator).toBe(0);
    expect(micro.bAcumulator).toBe(0);
    expect(micro.getData(0)).toBe(0);
    expect(micro.getData(1)).toBe(0);
  });
});
