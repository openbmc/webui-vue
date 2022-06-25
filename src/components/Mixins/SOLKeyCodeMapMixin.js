const SOLKeyCodeMapMixin = {
  methods: {
    keyCodeMap(key) {
      let keyVal = '';
      switch (key.keyCode) {
        case 116:
          keyVal = '\x1BOT';
          break;
        case 117:
          keyVal = '\x1BOU';
          break;
        case 118:
          keyVal = '\x1BOV';
          break;
        case 119:
          keyVal = '\x1BOW';
          break;
        case 120:
          keyVal = '\x1BOX';
          break;
        case 121:
          keyVal = '\x1BOY';
          break;
      }
      return keyVal;
    },
  },
};

export default SOLKeyCodeMapMixin;
