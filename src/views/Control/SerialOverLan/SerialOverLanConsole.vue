<template>
  <div :class="isFullWindow ? 'full-window-container' : 'terminal-container'">
    <b-row class="d-flex">
      <b-col class="d-flex flex-column justify-content-end">
        <dl class="mb-2" sm="6" md="6">
          <dt class="d-inline font-weight-bold mr-1">
            {{ $t('pageSerialOverLan.status') }}:
          </dt>
          <dd class="d-inline">
            <status-icon :status="hostStatusIcon" /> {{ connectionStatus }}
          </dd>
        </dl>
      </b-col>

      <b-col v-if="!isFullWindow" class="d-flex justify-content-end">
        <b-button variant="link" type="button" @click="openConsoleWindow()">
          <icon-launch />
          {{ $t('pageSerialOverLan.openNewTab') }}
        </b-button>
      </b-col>
    </b-row>
    <div id="terminal" ref="panel"></div>
  </div>
</template>

<script>
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import { throttle } from 'lodash';
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'SerialOverLanConsole',
  components: {
    IconLaunch,
    StatusIcon,
  },
  props: {
    isFullWindow: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      resizeConsoleWindow: null,
    };
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
    hostStatusIcon() {
      return this.hostStatus === 'on' ? 'success' : 'danger';
    },
    connectionStatus() {
      return this.hostStatus === 'on'
        ? this.$t('pageSerialOverLan.connected')
        : this.$t('pageSerialOverLan.disconnected');
    },
  },
  created() {
    this.$store.dispatch('global/getHostStatus');
  },
  mounted() {
    this.openTerminal();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeConsoleWindow);
  },
  methods: {
    openTerminal() {
      const token = this.$store.getters['authentication/token'];

      const ws = new WebSocket(`wss://${window.location.host}/console0`, [
        token,
      ]);

      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      const term = new Terminal({
        fontSize: 15,
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      });

      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)',
      };
      term.setOption('theme', SOL_THEME);

      term.open(this.$refs.panel);
      fitAddon.fit();

      this.resizeConsoleWindow = throttle(() => {
        fitAddon.fit();
      }, 1000);
      window.addEventListener('resize', this.resizeConsoleWindow);

      try {
        ws.onopen = function () {
          console.log('websocket console0/ opened');
        };
        ws.onclose = function (event) {
          console.log(
            'websocket console0/ closed. code: ' +
              event.code +
              ' reason: ' +
              event.reason
          );
        };
      } catch (error) {
        console.log(error);
      }
    },
    openConsoleWindow() {
      window.open(
        '#/console/serial-over-lan-console',
        '_blank',
        'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550'
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~xterm/css/xterm.css';

.terminal-container {
  #terminal {
    overflow: auto;
  }
}

.full-window-container {
  width: 97%;
  margin: 1.5%;
  #terminal {
    overflow: auto;
  }
}
</style>
