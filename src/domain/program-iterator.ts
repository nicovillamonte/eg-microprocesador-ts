import { byte } from '../types/byte.type';
import { ADD, Instruction, LODV, NOP, SWAP } from './instruction';

export class ProgramIterator {
  index = 0;

  constructor(public readonly program: byte[]) {}

  hasNext() {
    return this.index < this.program.length;
  }

  next() {
    const instructionCode = this.nextValue();
    return InstructionFactory.getInstruction(this, instructionCode);
  }

  nextValue() {
    return this.program[this.index++];
  }
}

class InstructionFactory {
  static instrucciones: { [key: number]: Instruction } = {
    1: new NOP(),
    2: new ADD(),
    5: new SWAP(),
    9: new LODV(0),
  };

  static getInstruction(
    programIterator: ProgramIterator,
    codigoInstruccion: number,
  ): Instruction {
    const instruccionClon = this.instrucciones[codigoInstruccion];
    if (!instruccionClon) {
      throw new Error(
        `La instrucción de código ${codigoInstruccion} no es reconocida`,
      );
    }
    const instruccionAEjecutar = instruccionClon.clone();
    instruccionAEjecutar.prepare(programIterator);
    return instruccionAEjecutar;
  }
}
