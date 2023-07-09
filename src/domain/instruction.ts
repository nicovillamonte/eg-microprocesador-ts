import { byte, toByte } from '../types/byte.type';
import { MicroProcessor } from './microprocessor';
import { ProgramIterator } from './program-iterator';

export abstract class Instruction {
  microBefore!: MicroProcessor;

  execute(micro: MicroProcessor) {
    this.microBefore = micro.copy();
    micro.advanceProgram();
    this.doExecute(micro);
  }

  abstract doExecute(micro: MicroProcessor): void;

  undo(micro: MicroProcessor) {
    micro.copyFrom(this.microBefore);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  prepare(programIterator: ProgramIterator) {}

  clone(): Instruction {
    return Object.create(this);
  }
}

export class NOP extends Instruction {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  doExecute(micro: MicroProcessor): void {
    // no hacemos nada
  }
}

export class LODV extends Instruction {
  constructor(public value: byte | number) {
    toByte(value); // Verificamos si es un byte válido antes de crear la instrucció
    super();
  }

  doExecute(micro: MicroProcessor): void {
    micro.aAcumulator = toByte(this.value);
  }

  prepare(programIterator: ProgramIterator): void {
    this.value = programIterator.nextValue();
  }
}

export class SWAP extends Instruction {
  doExecute(micro: MicroProcessor): void {
    const buffer = micro.aAcumulator;
    micro.aAcumulator = micro.bAcumulator;
    micro.bAcumulator = buffer;
  }
}

export class ADD extends Instruction {
  doExecute(micro: MicroProcessor): void {
    const suma = micro.aAcumulator + micro.bAcumulator;
    const maxValue = byte.MAX_VALUE;

    // en el acumulador A queda
    //    10 + 22 = 32    vs. 127  ==> 32
    //    120 + 15 = 135  vs. 127  ==> 127
    const aAcumulator = Math.min(suma, maxValue);

    // en el acumulador B queda
    //    10 + 22 = 32, 127 - 32 < 0 ==> 0
    //    120 + 15 = 135 - 127 > 0   ==> 8
    const bAcumulator = Math.max(0, suma - maxValue);

    micro.aAcumulator = toByte(aAcumulator);
    micro.bAcumulator = toByte(bAcumulator);
  }
}
