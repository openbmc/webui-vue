<template>
  <b-container fluid="xl">
    <page-title />
    <page-section :section-title="$t('pageSerialoverLAN.subTitle')">
      <dl>
        <dt>{{ $t('pageSerialoverLAN.subTitleDesc') }}</dt>
      </dl>
    </page-section>
    <div id="terminal" ref="panel"></div>

    <div class="float-right">
      <button variant="link" @click="openTerminalWindow()">
        <img
          class="logo"
          width="20px"
          src="@/assets/icons/icon-launch.svg"
          alt=""
        />
        Open in new tab
      </button>
    </div>
  </b-container>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';

export default {
  name: 'SerialOverLan',
  components: { PageTitle, PageSection },
  mounted() {
    this.openTerminal();
  },
  methods: {
    openTerminal() {
      const token = this.$store.getters['authentication/token'];

      const ws = new WebSocket(`wss://${window.location.host}/console0`, [
        token
      ]);

      const term = new Terminal();

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
    },
    openTerminalWindow() {
      window.open(
        '#/control/serial-over-lan',
        '_blank',
        'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550'
      );
    }
  }
};
</script>
<style scoped>
@import '~xterm/css/xterm.css';
</style>
