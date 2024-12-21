class Computer {
  #program;
  #regA;
  #regB;
  #regC;
  #instPtr;
  #output;

  constructor(initState = '') {
    this.setRegister('A', 0);
    this.setRegister('B', 0);
    this.setRegister('C', 0);
    this.#instPtr = 0;
    this.#output = [];

    initState.split('\n').forEach((line) => {
      const [field, value] = line.split(': ');
      if (value == null) return;

      switch (field.toUpperCase()) {
        case 'REGISTER A':
        case 'REGISTER B':
        case 'REGISTER C':
          this.setRegister(
            field.slice(field.length - 1),
            Number.parseInt(value, 10),
          );
          break;
        case 'PROGRAM':
          this.loadProgram(value);
          break;
        default:
          break;
      }
    });
  }

  loadProgram(program) {
    this.#program = program
      .split(',')
      .map((value) => Number.parseInt(value, 10));
    this.#instPtr = 0;
    this.#output = [];
  }

  setRegister(register, value) {
    switch (register) {
      case 'A':
      case 'a':
        this.#regA = value;
        break;
      case 'B':
      case 'b':
        this.#regB = value;
        break;
      case 'C':
      case 'c':
        this.#regC = value;
        break;
      default:
        break;
    }
  }

  readRegister(register) {
    switch (register) {
      case 'A':
      case 'a':
        return this.#regA;
      case 'B':
      case 'b':
        return this.#regB;
      case 'C':
      case 'c':
        return this.#regC;
      default:
        return null;
    }
  }

  #getComboValue(value) {
    if (value >= 0 && value <= 3) return value;

    switch (value) {
      case 4:
        return this.#regA;
      case 5:
        return this.#regB;
      case 6:
        return this.#regC;
      default:
        return 0;
    }
  }

  #adv(operand) {
    // eslint-disable-next-line no-bitwise
    this.#regA >>= this.#getComboValue(operand);
    return true;
  }

  #bxl(operand) {
    // eslint-disable-next-line no-bitwise
    this.#regB ^= operand;
    return true;
  }

  #bst(operand) {
    this.#regB = this.#getComboValue(operand) % 8;
    return true;
  }

  #jnz(operand) {
    if (this.#regA === 0) return true;

    this.#instPtr = operand;
    return false;
  }

  #bxc() {
    // eslint-disable-next-line no-bitwise
    this.#regB ^= this.#regC;
    return true;
  }

  #out(operand) {
    this.#output.push(this.#getComboValue(operand) % 8);
    return true;
  }

  #bdv(operand) {
    // eslint-disable-next-line no-bitwise
    this.#regB = this.#regA >> this.#getComboValue(operand);
    return true;
  }

  #cdv(operand) {
    // eslint-disable-next-line no-bitwise
    this.#regC = this.#regA >> this.#getComboValue(operand);
    return true;
  }

  runInstruction(opcode, operand) {
    const operations = [
      this.#adv,
      this.#bxl,
      this.#bst,
      this.#jnz,
      this.#bxc,
      this.#out,
      this.#bdv,
      this.#cdv,
    ].map((op) => op.bind(this));

    const operation =
      opcode >= 0 && opcode < operations.length
        ? operations[opcode]
        : () => true;

    return operation(operand);
  }

  run() {
    while (this.#instPtr + 1 < this.#program.length) {
      const opcode = this.#program[this.#instPtr];
      const operand = this.#program[this.#instPtr + 1];
      if (this.runInstruction(opcode, operand)) this.#instPtr += 2;
    }

    return this.#output;
  }
}

export default function run(input) {
  const computer = new Computer(input);
  return computer.run().join(',');
}
