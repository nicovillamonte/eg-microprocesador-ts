import { byte, toByte } from '../types/byte.type';
import { MicroProcessor } from './microprocessor';

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
}

export class NOP extends Instruction {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  doExecute(micro: MicroProcessor): void {
    // no hacemos nada
  }
}

export class LODV extends Instruction {
  constructor(public readonly value: byte | number) {
    toByte(value); // Verificamos si es un byte válido antes de crear la instrucció
    super();
  }

  doExecute(micro: MicroProcessor): void {
    micro.aAcumulator = toByte(this.value);
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

abstract class CompoundNotZeroInstruction extends Instruction {
  constructor(public readonly instructions: Instruction[]) {
    super();
  }

  doExecute(micro: MicroProcessor): void {
    micro.run(this.instructions);
  }

  notZero(micro: MicroProcessor): boolean {
    return micro.aAcumulator !== toByte(0);
  }
}

export class IFNZ extends CompoundNotZeroInstruction {
  doExecute(micro: MicroProcessor): void {
    if (this.notZero(micro)) {
      super.doExecute(micro);
    }
  }
}

export class WHNZ extends CompoundNotZeroInstruction {
  doExecute(micro: MicroProcessor): void {
    while (this.notZero(micro)) {
      super.doExecute(micro);
    }
  }
}

// Instrucciones para testear el while
export class STR extends Instruction {
  constructor(public readonly address: number) {
    super();
  }

  doExecute(micro: MicroProcessor): void {
    micro.setData(this.address, micro.aAcumulator);
  }
}

export class LOD extends Instruction {
  constructor(public readonly address: number) {
    super();
  }

  doExecute(micro: MicroProcessor): void {
    micro.aAcumulator = micro.getData(this.address);
  }
}

export class SUB extends Instruction {
  doExecute(micro: MicroProcessor): void {
    micro.aAcumulator = toByte(micro.aAcumulator - micro.bAcumulator);
    micro.bAcumulator = toByte(0);
  }
}
