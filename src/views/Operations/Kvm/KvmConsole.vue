<template>
  <div :class="marginClass">
    <div ref="toolbar" class="kvm-toolbar">
      <BRow class="d-flex">
        <BCol class="d-flex flex-column justify-content-end" cols="4">
          <dl class="mb-2" sm="2" md="2">
            <dt class="d-inline font-weight-bold mr-1">
              {{ $t('pageKvm.status') }}:
            </dt>
            <dd class="d-inline">
              <status-icon :status="serverStatusIcon" />
              <span class="d-none d-md-inline"> {{ serverStatus }}</span>
            </dd>
          </dl>
        </BCol>

        <BCol class="d-flex justify-content-end pr-1">
          <BButton
            v-if="isConnected"
            variant="link"
            type="button"
            @click="sendCtrlAltDel"
          >
            <!-- <icon-arrow-down /> -->
            {{ $t('pageKvm.buttonCtrlAltDelete') }}
          </BButton>
          <BButton
            v-if="!isFullWindow"
            variant="link"
            type="button"
            @click="openConsoleWindow()"
          >
            <!-- <icon-launch /> -->
            {{ $t('pageKvm.openNewTab') }}
          </BButton>
        </BCol>
      </BRow>
    </div>
    <div id="terminal-kvm" ref="panel" :class="terminalClass"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
import i18n from '@/i18n';
import RFB from '@novnc/novnc/core/rfb';
import StatusIcon from '../../../components/Global/StatusIcon.vue';
import { throttle } from 'lodash';
import { AuthenticationStore } from '../../../store/modules/Authentication/AuthenticationStore';

const authenticationStore = AuthenticationStore();
const Connecting = 0;
const Connected = 1;
const Disconnected = 2;
const props = defineProps(['isFullWindow']);
let rfb = ref(null);
let isConnected = ref(false);
let terminalClass = ref(props.isFullWindow ? 'full-window' : '');
let marginClass = props.isFullWindow ? 'margin-left-full-window' : '';
let status = Connecting;
let convasRef = ref(null);
let resizeKvmWindow = ref(null);
const serverStatusIcon = computed(() => {
  if (status === Connected) {
    return 'success';
  } else if (status === Disconnected) {
    return 'danger';
  }
  return 'secondary';
});
const serverStatus = computed(() => {
  if (status === Connected) {
    return i18n.global.t('pageKvm.connected');
  } else if (status === Disconnected) {
    return i18n.global.t('pageKvm.disconnected');
  }
  return i18n.global.t('pageKvm.connecting');
});

onMounted(() => {
  openTerminal();
});
onBeforeUnmount(() => {
  // Your cleanup logic here
  window.removeEventListener('resize', resizeKvmWindow);
  closeTerminal();
});

const sendCtrlAltDel = () => {
  rfb.sendCtrlAltDel();
};
const closeTerminal = () => {
  rfb.disconnect();
  rfb = null;
};
const panel = ref(null);
const toolbar = ref(null);
const openTerminal = () => {
  const token = authenticationStore.token;
  rfb = new RFB(
    document.getElementById('terminal-kvm'),
    `wss://${window.location.host}/kvm/0`,
    { wsProtocols: [token] }
  );
  rfb.scaleViewport = true;
  rfb.clipViewport = true;

  resizeKvmWindow = throttle(() => {
    setTimeout(setWidthToolbar, 0);
  }, 1000);
  window.addEventListener('resize', resizeKvmWindow);

  rfb.addEventListener('connect', () => {
    isConnected = true;
    status = Connected;
    setWidthToolbar();
  });
  rfb.addEventListener('disconnect', () => {
    isConnected = false;
    status = Disconnected;
  });
};
const setWidthToolbar = () => {
  if (
    document.getElementById('terminal-kvm').children &&
    document.getElementById('terminal-kvm').children.length > 0 &&
    document.getElementById('terminal-kvm').children[0].children.length > 0
  ) {
    toolbar.style.width =
      document.getElementById('terminal-kvm').children[0].children[0]
        .clientWidth -
      10 +
      'px';
  }
};
const openConsoleWindow = () => {
  // If consoleWindow is not null
  // Check the newly opened window is closed or not
  if ($eventBus.$consoleWindow) {
    // If window is not closed set focus to new window
    // If window is closed, do open new window
    if (!$eventBus.$consoleWindow.closed) {
      $eventBus.$consoleWindow.focus();
      return;
    } else {
      openNewWindow();
    }
  } else {
    // If consoleWindow is null, open new window
    openNewWindow();
  }
};
const openNewWindow = () => {
  this.$eventBus.$consoleWindow = window.open(
    '#/console/kvm',
    'kvmConsoleWindow',
    'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=700,height=550'
  );
};
</script>

<style scoped lang="scss">
.button-ctrl-alt-delete {
  float: right;
}

.kvm-status {
  padding-top: calc($spacer / 2);
  padding-left: calc($spacer / 4);
  display: inline-block;
}

.margin-left-full-window {
  margin-left: 5px;
}
</style>
