const OP_INI = 'INI';
const OP_AND = 'AND';
const OP_OR = 'OR';
const OP_XOR = 'XOR';
const MAX_BITS = 100;

class WireSystem {
  #wires;

  constructor(connections) {
    const [initValues, gates] = connections.split('\n\n');
    this.#wires = new Map();

    initValues.split('\n').forEach((line) => {
      const [name, valueStr] = line.split(': ');
      const value = Number.parseInt(valueStr, 10);

      this.#wires.set(name, {
        operation: OP_INI,
        leftOperand: null,
        rightOperand: null,
        output: Boolean(value),
      });
    });

    const gateRegExp = new RegExp(
      `(\\w+) (${OP_AND}|${OP_OR}|${OP_XOR}) (\\w+) -> (\\w+)`,
    );
    gates.split('\n').forEach((line) => {
      if (line.length === 0) return;

      const tokens = line.match(gateRegExp);
      this.#wires.set(tokens[4], {
        operation: tokens[2],
        leftOperand: tokens[1],
        rightOperand: tokens[3],
        output: null,
      });
    });
  }

  readWire(wireName) {
    if (!this.#wires.has(wireName)) return null;

    const wire = this.#wires.get(wireName);
    if (wire.output == null) {
      const leftValue = this.readWire(wire.leftOperand);
      const rightValue = this.readWire(wire.rightOperand);
      switch (wire.operation) {
        case OP_AND:
          wire.output = leftValue && rightValue;
          break;
        case OP_OR:
          wire.output = leftValue || rightValue;
          break;
        case OP_XOR:
          wire.output = leftValue !== rightValue;
          break;
        default:
          break;
      }
    }

    return wire.output;
  }

  readWireString(wirePrefix) {
    let result = 0;
    for (let bit = 0; bit < MAX_BITS; bit++) {
      const wireName = `${wirePrefix}${bit < 10 ? '0' : ''}${bit}`;
      const wireValue = this.readWire(wireName);
      if (wireValue == null) break;
      if (wireValue) result += 2 ** bit;
    }

    return result;
  }
}

export default function run(input) {
  const monitoringDevice = new WireSystem(input);
  return monitoringDevice.readWireString('z');
}
