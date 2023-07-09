import { SystemError } from '../errors/system.error';
import { byte, toByte } from '../types/byte.type';
import { Instruction } from './instruction';
import { ProgramIterator } from './program-iterator';

export interface MicroProcessor {
  /**
   * carga el programa en memoria, el microcontrolador debe estar detenido
   */
  loadProgram(program: Array<byte>): void;

  // control de programa
  /**
   * Ejecuta un programa cargado en memoria
   */
  run(program: Instruction[]): void;

  /**
   * Borra la memoria de datos y comienza la ejecucion del programa cargado
   * actualmente
   */
  start(): void;

  /**
   * Detiene el programa en ejecucion
   */
  stop(): void;

  /**
   * Ejecuta la siguiente instruccion del programa actual
   */
  step(): Instruction;

  /**
   * Inicializa el microcontrolador
   */
  reset(): void;

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

  /**
   * Manejo de dirección de memoria de datos: getter y setter
   */
  getData(addr: number): byte;
  setData(addr: number, value: byte): void;
  copy(): MicroProcessor;
  copyFrom(other: MicroProcessor): void;
}

export class MicroProcessorImpl implements MicroProcessor {
  aAcumulator: byte = toByte(0);
  bAcumulator: byte = toByte(0);
  programCounter: byte = toByte(0);
  data = new Map<number, byte>();

  programStarted = false;
  programIterator!: ProgramIterator;

  loadProgram(program: byte[]): void {
    if (this.programStarted)
      throw new SystemError('Ya hay un programa en ejecución');
    this.reset();
    this.programIterator = new ProgramIterator(program);
  }

  start(): void {
    this.programStarted = true;
  }

  stop(): void {
    this.programStarted = false;
  }

  step(): Instruction {
    if (!this.programStarted)
      throw new SystemError('El programa no está iniciado');
    if (!this.programIterator.hasNext())
      throw new SystemError('No hay más instrucciones para ejecutar');
    const nextInstruction = this.programIterator.next();
    nextInstruction.execute(this);
    return nextInstruction;
  }

  run() {
    this.start();
    while (this.programIterator.hasNext()) {
      this.step();
    }
    this.stop();
  }

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
