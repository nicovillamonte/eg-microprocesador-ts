import { byte, toByte } from '../types/byte.type';
import { Instruction } from './instruction';

export interface MicroProcessor {
  /**
   * programacion: carga y ejecuta un conjunto de instrucciones en memoria
   */
  run(program: Instruction[]): void;

  /**
   * Getters y setters de acumuladores A y B
   */
  aAcumulator: byte;
  bAcumulator: byte;

  /**
   * Manejo de program counter
   */
  advanceProgram(): void;
  programCounter: byte;

  reset(): void;

  /**
   * Manejo de dirección de memoria de datos: getter y setter
   */
  getData(addr: number): byte;
  setData(addr: number, value: byte): void;
  copy(): MicroProcessor;
  copyFrom(other: MicroProcessor): void;
}

export class MicroProcessorImpl implements MicroProcessor {
  run(program: Instruction[]): void {
    program.forEach((instruction) => instruction.execute(this));
  }

  aAcumulator: byte = toByte(0);
  bAcumulator: byte = toByte(0);
  programCounter: byte = toByte(0);
  data = new Map<number, byte>();

  advanceProgram(): void {
    this.programCounter = toByte(this.programCounter + 1); // Ver si dar error o empezar del 0
  }

  reset(): void {
    this.aAcumulator = toByte(0);
    this.bAcumulator = toByte(0);
    this.programCounter = toByte(0);
    this.data.clear();
  }

  getData = (addr: number): byte => this.data.get(addr) ?? toByte(0);

  setData = (addr: number, value: byte): void => {
    this.data.set(addr, value);
  };

  copy(): MicroProcessor {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  copyFrom(other: MicroProcessor): void {
    this.aAcumulator = other.aAcumulator;
    this.bAcumulator = other.bAcumulator;
    this.programCounter = other.programCounter;
    Array.from({ length: 1024 }).forEach((_, i) => {
      this.setData(i, other.getData(i));
    });
  }
}
