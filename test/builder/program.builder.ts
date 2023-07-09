import { BusinessError } from '../../src/errors/business.error';
import { byte, toByte } from '../../src/types/byte.type';

export class ProgramBuilder {
  readonly program = new Array<byte>();

  LODV(value: number): ProgramBuilder {
    this.program.push(toByte(9));
    this.program.push(toByte(value));
    return this;
  }

  SWAP(): ProgramBuilder {
    this.program.push(toByte(5));
    return this;
  }

  ADD(): ProgramBuilder {
    this.program.push(toByte(2));
    return this;
  }

  NOP(): ProgramBuilder {
    this.program.push(toByte(1));
    return this;
  }

  build(): Array<byte> {
    if (this.program.length === 0) {
      throw new BusinessError('El programa no puede estar vacío');
    }
    return this.program;
  }
}
