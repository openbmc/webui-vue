<template>
  <div class="terminal-container">
    <template>
      <b-row class="d-flex">
        <b-col class="d-flex flex-column justify-content-end">
          <dl class="mb-2" sm="6" md="6">
            <dt class="d-inline font-weight-bold mr-1">
              {{ $t('pageSerialoverLAN.status') }}:
            </dt>
            <dd class="d-inline">
              <status-icon :status="hostStatusIcon" /> {{ connectionStatus }}
            </dd>
          </dl>
        </b-col>

        <b-col v-if="!isFullWindow" class="d-flex justify-content-end">
          <b-button
            variant="link"
            type="button"
            class="pr-0 button-launch"
            @click="openConsoleWindow()"
          >
            <icon-launch aria-hidden="true" />

            {{ $t('pageSerialoverLAN.openNewTab') }}
          </b-button>
        </b-col>
      </b-row>
    </template>
    <div id="terminal" ref="panel"></div>
  </div>
</template>

<script>
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'SerialOverLanConsole',
  components: {
    IconLaunch,
    StatusIcon
  },
  props: {
    isFullWindow: {
      type: Boolean,
      default: true
    }
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
        ? this.$t('pageSerialoverLAN.connected')
        : this.$t('pageSerialoverLAN.disconnected');
    }
  },
  created() {
    this.$store.dispatch('global/getHostStatus');
  },
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
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'
      });

      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)'
      };
      term.setOption('theme', SOL_THEME);

      term.open(this.$refs.panel);
      fitAddon.fit();

      try {
        ws.onopen = function() {
          console.log('websocket console0/ opened');
        };
        ws.onclose = function(event) {
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
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~xterm/css/xterm.css';

#terminal {
  height: 49vh;
}
@media only screen and (max-width: 615px) {
  .terminal-container {
    #terminal {
      overflow-x: auto;
    }
  }
}
// @media (min-width: 615px) and (max-width: 795px) {
//   .terminal-container {
//     width: 85%;
//   }
// }
// @media (min-width: 795px) and (max-width: 990px) {
//   .terminal-container {
//     width: 75%;
//   }
// }
// @media (min-width: 990px) and (max-width: 1140px) {
//   .terminal-container {
//     width: 85%;
//   }
// }
@media only screen and (min-width: 1140px) {
  .terminal-container {
    width: 50%;
  }
}
</style>
