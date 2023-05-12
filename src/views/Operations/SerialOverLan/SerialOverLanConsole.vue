<template>
  <div :class="isFullWindow ? 'full-window-container' : 'terminal-container'">
    <b-row class="d-flex">
      <b-col sm="4" md="6">
        <alert
          v-if="connection ? false : true"
          variant="warning"
          :small="true"
          class="mt-4"
        >
          <p class="col-form-label">
            {{ $t('pageSerialOverLan.alert.disconnectedAlertMessage') }}
          </p>
        </alert>
      </b-col>
    </b-row>
    <b-row class="d-flex">
      <b-col class="d-flex flex-column justify-content-end">
        <dl class="mb-2" sm="6" md="6">
          <dt class="d-inline font-weight-bold mr-1">
            {{ $t('pageSerialOverLan.status') }}:
          </dt>
          <dd class="d-inline">
            <status-icon :status="serverStatusIcon" />
            {{
              connection
                ? $t('pageSerialOverLan.connected')
                : $t('pageSerialOverLan.disconnected')
            }}
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
import Alert from '@/components/Global/Alert';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import { throttle } from 'lodash';
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'SerialOverLanConsole',
  components: {
    Alert,
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
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    connection() {
      return this.serverStatus === 'off' ? false : true;
    },
    serverStatusIcon() {
      return this.connection ? 'success' : 'danger';
    },
  },
  created() {
    this.$store.dispatch('global/getSystemInfo');
  },
  mounted() {
    this.openTerminal();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeConsoleWindow);
    this.closeTerminal();
  },
  methods: {
    openTerminal() {
      const token = this.$store.getters['authentication/token'];
      this.ws = new WebSocket(`wss://${window.location.host}/console/default`, [
        token,
      ]);

      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      this.term = new Terminal({
        fontSize: 15,
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      });

      const attachAddon = new AttachAddon(this.ws);
      this.term.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      this.term.loadAddon(fitAddon);

      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)',
      };
      this.term.setOption('theme', SOL_THEME);

      this.term.open(this.$refs.panel);
      fitAddon.fit();

      this.resizeConsoleWindow = throttle(() => {
        fitAddon.fit();
      }, 1000);
      window.addEventListener('resize', this.resizeConsoleWindow);

      try {
        this.ws.onopen = function () {
          console.log('websocket console/default opened');
        };
        this.ws.onclose = function (event) {
          console.log(
            'websocket console/default closed. code: ' +
              event.code +
              ' reason: ' +
              event.reason
          );
        };
      } catch (error) {
        console.log(error);
      }
    },
    closeTerminal() {
      console.log('closeTerminal');
      this.term.dispose();
      this.term = null;
      this.ws.close();
      this.ws = null;
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

#terminal {
  overflow: auto;
}

.full-window-container {
  width: 97%;
  margin: 1.5%;
}
</style>
