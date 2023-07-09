import { SystemError } from '../src/errors/system.error';
import { MicroProcessorImpl } from '../src/domain/microprocessor';
import { ProgramBuilder } from './builder/program.builder';
import { byte } from '../src/types/byte.type';
import { BusinessError } from '../src/errors/business.error';

describe('dado un microprocesador', () => {
  let micro!: MicroProcessorImpl;

  beforeEach(() => {
    micro = new MicroProcessorImpl();
  });

  it('si quiero ejecutar un paso y no hay un programa cargado da error', () => {
    expect(() => micro.step()).toThrowError(SystemError);
  });

  it('si quiero ejecutar un paso con un programa cargado y no se inició debe dar error', () => {
    micro.loadProgram(new ProgramBuilder().NOP().build());
    expect(() => micro.step()).toThrowError(SystemError);
  });

  it('si quiero ejecutar un programa manualmente más allá de la última instrucción debe dar error', () => {
    micro.loadProgram(new ProgramBuilder().NOP().build());
    micro.start();
    micro.step();
    expect(() => micro.step()).toThrowError(SystemError);
  });

  it('si quiero ejecutar una instrucción que no existe debe dar error', () => {
    const instruccionInexistente = 150 as byte;
    micro.loadProgram([instruccionInexistente]);
    expect(() => micro.step()).toThrowError(SystemError);
  });

  it('si quiero cargar un programa cuando hay otro en ejecución debe dar error', () => {
    const program = new ProgramBuilder().NOP().build();
    micro.loadProgram(program);
    micro.start();
    expect(() => micro.loadProgram(program)).toThrowError(SystemError);
  });

  it('no puedo generar un programa vacío para cargarlo', () => {
    expect(() => micro.loadProgram(new ProgramBuilder().build())).toThrowError(
      BusinessError,
    );
  });

  it('ejecuta correctamente el programa NOP', () => {
    micro.loadProgram(new ProgramBuilder().NOP().NOP().NOP().build());
    micro.run();

    expect(micro.programCounter).toBe(3);
  });

  it('ejecuta correctamente una suma chica', () => {
    micro.loadProgram(
      new ProgramBuilder().LODV(10).SWAP().LODV(22).ADD().build(),
    );
    micro.run();

    expect(micro.programCounter).toBe(4);
    expect(micro.aAcumulator).toBe(32);
    expect(micro.bAcumulator).toBe(0);
  });

  it('ejecuta correctamente una suma grande', () => {
    micro.loadProgram(
      new ProgramBuilder().LODV(120).SWAP().LODV(15).ADD().build(),
    );
    micro.run();

    expect(micro.programCounter).toBe(4);
    expect(micro.aAcumulator).toBe(127);
    expect(micro.bAcumulator).toBe(8);
  });
});
