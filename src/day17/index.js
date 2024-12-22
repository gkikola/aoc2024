const REGISTER_A = 4;
const REGISTER_B = 5;
const REGISTER_C = 6;

const ADV = 0;
const BXL = 1;
const BST = 2;
const JNZ = 3;
const BXC = 4;
const OUT = 5;
const BDV = 6;
const CDV = 7;

class Computer {
  #program;
  #regA;
  #regB;
  #regC;
  #instPtr;
  #output;

  constructor(initState = '') {
    this.setRegister(REGISTER_A, 0);
    this.setRegister(REGISTER_B, 0);
    this.setRegister(REGISTER_C, 0);
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
    this.resetProgram();
  }

  resetProgram() {
    this.#instPtr = 0;
    this.#output = [];
  }

  static isRegister(register) {
    return register >= REGISTER_A && register <= REGISTER_C;
  }

  setRegister(register, value) {
    const converted = BigInt(value);
    switch (register) {
      case REGISTER_A:
      case 'A':
      case 'a':
        this.#regA = converted;
        break;
      case REGISTER_B:
      case 'B':
      case 'b':
        this.#regB = converted;
        break;
      case REGISTER_C:
      case 'C':
      case 'c':
        this.#regC = converted;
        break;
      default:
        break;
    }
  }

  readRegister(register) {
    switch (register) {
      case REGISTER_A:
      case 'A':
      case 'a':
        return this.#regA;
      case REGISTER_B:
      case 'B':
      case 'b':
        return this.#regB;
      case REGISTER_C:
      case 'C':
      case 'c':
        return this.#regC;
      default:
        return null;
    }
  }

  #getComboValue(value) {
    if (value >= 0 && value <= 3) return BigInt(value);

    switch (value) {
      case REGISTER_A:
        return this.#regA;
      case REGISTER_B:
        return this.#regB;
      case REGISTER_C:
        return this.#regC;
      default:
        return 0n;
    }
  }

  #adv(operand) {
    // eslint-disable-next-line no-bitwise
    this.#regA >>= this.#getComboValue(operand);
    return true;
  }

  #bxl(operand) {
    // eslint-disable-next-line no-bitwise
    this.#regB ^= BigInt(operand);
    return true;
  }

  #bst(operand) {
    this.#regB = this.#getComboValue(operand) % 8n;
    return true;
  }

  #jnz(operand) {
    if (this.#regA === 0n) return true;

    this.#instPtr = operand;
    return false;
  }

  #bxc() {
    // eslint-disable-next-line no-bitwise
    this.#regB ^= this.#regC;
    return true;
  }

  #out(operand) {
    this.#output.push(Number(this.#getComboValue(operand) % 8n));
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
    switch (opcode) {
      case ADV:
        return this.#adv(operand);
      case BXL:
        return this.#bxl(operand);
      case BST:
        return this.#bst(operand);
      case JNZ:
        return this.#jnz(operand);
      case BXC:
        return this.#bxc(operand);
      case OUT:
        return this.#out(operand);
      case BDV:
        return this.#bdv(operand);
      case CDV:
        return this.#cdv(operand);
      default:
        return true;
    }
  }

  run() {
    while (this.#instPtr + 1 < this.#program.length) {
      const opcode = this.#program[this.#instPtr];
      const operand = this.#program[this.#instPtr + 1];
      if (this.runInstruction(opcode, operand)) this.#instPtr += 2;
    }

    return this.#output;
  }

  get program() {
    return this.#program;
  }

  get output() {
    return this.#output;
  }

  toString() {
    let result = '';
    result += ['A', 'B', 'C']
      .map((reg) => `Register ${reg}: ${this.readRegister(reg)}`)
      .join('\n');
    result += `\nProgram: ${this.#program.join(',')}\n`;
    result += `Instruction Pointer: ${this.#instPtr}\n`;
    result += `Output: "${this.#output.join(',')}"`;

    return result;
  }
}

class ValueFinder {
  #computer;

  constructor(computer) {
    this.#computer = computer;
  }

  #testValue(value) {
    this.#computer.resetProgram();
    this.#computer.setRegister(REGISTER_A, value);
    return this.#computer.run();
  }

  #testResult(result) {
    const { program } = this.#computer;
    if (result.length !== program.length) return false;

    for (let i = 0; i < result.length; i++) {
      if (result[i] !== program[i]) return false;
    }

    return true;
  }

  #findValueHelper(startValue = 0n, outputPos = 0) {
    /* eslint-disable-next-line no-bitwise */
    const shiftedValue = startValue << 3n;
    const { program } = this.#computer;
    const target = program[program.length - outputPos - 1];

    for (let i = 0n; i < 8n; i++) {
      const trialValue = shiftedValue + i;
      const result = this.#testValue(trialValue);
      const posValue = result[result.length - outputPos - 1];
      if (posValue === target) {
        if (outputPos >= program.length - 1) {
          if (this.#testResult(result)) return trialValue;
        } else {
          const nestedResult = this.#findValueHelper(trialValue, outputPos + 1);
          if (nestedResult != null) return nestedResult;
        }
      }
    }

    return null;
  }

  findInitialValue() {
    return this.#findValueHelper();
  }
}

export default function run(input) {
  const computer = new Computer(input);
  const predictor = new ValueFinder(computer);
  return [computer.run().join(','), predictor.findInitialValue().toString()];
}
