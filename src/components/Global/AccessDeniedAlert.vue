<template>
  <b-row class="d-flex">
    <b-col sm="6">
      <alert variant="danger" :small="true" class="mt-4">
        <p class="col-form-label">
          {{ $t('global.accessDeniedAlert.message') }}
        </p>
        <dl v-if="sessionRoles.length" class="mt-2 mb-0">
          <dt class="fw-bold">
            {{ $t('global.accessDeniedAlert.sessionRoles') }}
          </dt>
          <dd>{{ sessionRoles.join(', ') }}</dd>
        </dl>
        <template
          v-for="(privs, role) in rolePrivileges"
          :key="role"
        >
          <dl v-if="privs.assignedPrivileges.length" class="mt-1 mb-0">
            <dt class="fw-bold">
              {{ $t('global.accessDeniedAlert.assignedPrivileges') }}
              ({{ role }})
            </dt>
            <dd>{{ privs.assignedPrivileges.join(', ') }}</dd>
          </dl>
          <dl
            v-if="privs.oemPrivileges.length"
            class="mt-1 mb-0"
          >
            <dt class="fw-bold">
              {{ $t('global.accessDeniedAlert.oemPrivileges') }}
              ({{ role }})
            </dt>
            <dd>{{ privs.oemPrivileges.join(', ') }}</dd>
          </dl>
        </template>
      </alert>
    </b-col>
  </b-row>
</template>

<script>
import Alert from '@/components/Global/Alert';
import { usePrivilegeCheck } from '@/components/Composables/usePrivilegeCheck';

export default {
  name: 'AccessDeniedAlert',
  components: {
    Alert,
  },
  setup() {
    const { sessionRoles, rolePrivileges } = usePrivilegeCheck();
    return { sessionRoles, rolePrivileges };
  },
};
</script>
