<template>
  <b-container fluid="xl">
    <div id="terminal" ref="panel"></div>
  </b-container>
</template>

<script>
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';

export default {
  name: 'SerialOverLanConsole',
  mounted() {
    this.openTerminal();
  },
  methods: {
    openTerminal() {
      const token = this.$store.getters['authentication/token'];

      const ws = new WebSocket(`wss://${window.location.host}/console0`, [
        token
      ]);

      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      const term = new Terminal({
        fontSize: 15,
        fontFamily: 'Dejavu Sans'
      });

      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)'
      };
      term.setOption('theme', SOL_THEME);

      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);
      term.loadAddon(new FitAddon());
      term.open(this.$refs.panel);

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
