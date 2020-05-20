<template>
  <div id="terminal" ref="panel"></div>
</template>

<script>
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';

export default {
  name: 'SerialOverLanConsole',
  mounted() {
    const term = new Terminal({
      fontSize: 15,
      fontFamily: 'Dejavu Sans'
    });
    window.addEventListener('resize', this.myEventHandler);
    this.openTerminal(term);
  },
  methods: {
    myEventHandler() {
      const term = new Terminal({
        fontSize: 15,
        fontFamily: 'Dejavu Sans'
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      console.log(term.rows, term.cols);
      term.resize(term.rows, term.cols);
      fitAddon.fit();
    },
    openTerminal(term) {
      // term.resize(cols, rows);
      const token = this.$store.getters['authentication/token'];

      const ws = new WebSocket(`wss://${window.location.host}/console0`, [
        token
      ]);

      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      // const term = new Terminal({
      //   fontSize: 15,
      //   fontFamily: 'Dejavu Sans'
      // });

      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)'
      };
      term.setOption('theme', SOL_THEME);

      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(this.$refs.panel);
      fitAddon.fit();

      try {
        ws.onopen = function() {
          console.log('websocket opened');
        };
        ws.onclose = function(event) {
          console.log(
            'websocket closed. code: ' + event.code + ' reason: ' + event.reason
          );
        };
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>

<style scoped>
@import '~xterm/css/xterm.css';
</style>
