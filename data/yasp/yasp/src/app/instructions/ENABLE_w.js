{
  "name": "ENABLE",
  "doc": {
    "de": {
      "description": "Aktiviert die Interrupts, die in der gegebenen Maske binär 1 sind, z.B.: 0x03 = 00000011b = interrupts 1 und 2",
      "flags": {
      }
    },
    "en": {
      "description": "Enables Interrupts based on the given mask, z.B.: 0x03 = 00000011b = interrupts 1 and 2",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "ENABLE 42",
      steps: { interruptMask: [ false, true, false, true, false, true, false, false ] }
    }
  ],
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "11100001"
    }
  ],
  "params": [
    {
      "type": "l_byte"
    }
  ],
  "exec": function (lbyte) {
    this.setInterruptMask(lbyte.value);
  }
}
