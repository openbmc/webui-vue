<template>
  <b-modal id="modal-user" ref="modal" @ok="onOk" @hidden="resetForm">
    <template v-slot:modal-title>
      <template v-if="newUser">
        Add user
      </template>
      <template v-else>
        Edit user
      </template>
    </template>
    <b-form novalidate @submit="handleSubmit">
      <b-container>
        <b-row>
          <b-col>
            <b-form-group label="Account status">
              <b-form-radio
                v-model="form.status"
                name="user-status"
                :value="true"
                @input="$v.form.status.$touch()"
              >
                Enabled
              </b-form-radio>
              <b-form-radio
                v-model="form.status"
                name="user-status"
                :value="false"
                @input="$v.form.status.$touch()"
              >
                Disabled
              </b-form-radio>
            </b-form-group>
            <b-form-group label="Username" label-for="username">
              <b-form-text id="username-help-block">
                Cannot start with a number
                <br />
                No special characters except underscore
              </b-form-text>
              <b-form-input
                id="username"
                v-model="form.username"
                type="text"
                aria-describedby="username-help-block"
                :state="getValidationState($v.form.username)"
                :disabled="!newUser && originalUsername === 'root'"
              />
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.username.required">
                  Field required
                </template>
                <template v-else-if="!$v.form.username.maxLength">
                  Length must be between 1 – 16 characters
                </template>
                <template v-else-if="!$v.form.username.pattern">
                  Invalid format
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Privilege">
              <b-form-select
                v-model="form.privilege"
                :options="privilegeTypes"
                :state="getValidationState($v.form.privilege)"
                @input="$v.form.privilege.$touch()"
              >
              </b-form-select>
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.privilege.required">
                  Field required
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="User password" label-for="password">
              <b-form-text id="password-help-block" text-variant="black">
                <!-- TODO: Should be dynamic values -->
                Password must between 8 – 20 characters
              </b-form-text>
              <input-password-toggle>
                <b-form-input
                  id="password"
                  v-model="form.password"
                  type="password"
                  aria-describedby="password-help-block"
                  :state="getValidationState($v.form.password)"
                  @input="$v.form.password.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.password.required">
                    Field required
                  </template>
                  <template
                    v-if="
                      !$v.form.password.minLength || !$v.form.password.maxLength
                    "
                  >
                    Length must be between 8 – 20 characters
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
            <b-form-group
              label="Confirm user password"
              label-for="password-confirmation"
            >
              <input-password-toggle>
                <b-form-input
                  id="password-confirmation"
                  v-model="form.passwordConfirmation"
                  type="password"
                  :state="getValidationState($v.form.passwordConfirmation)"
                  @input="$v.form.passwordConfirmation.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.passwordConfirmation.required">
                    Field required
                  </template>
                  <template
                    v-else-if="!$v.form.passwordConfirmation.sameAsPassword"
                  >
                    Passwords do not match
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </b-form>
    <template v-slot:modal-ok>
      <template v-if="newUser">
        Add user
      </template>
      <template v-else>
        Save
      </template>
    </template>
  </b-modal>
</template>

<script>
import {
  required,
  maxLength,
  minLength,
  sameAs,
  helpers,
  requiredIf
} from 'vuelidate/lib/validators';
import VuelidateMixin from '../../../components/Mixins/VuelidateMixin.js';
import InputPasswordToggle from '../../../components/Global/InputPasswordToggle';

export default {
  components: { InputPasswordToggle },
  mixins: [VuelidateMixin],
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      privilegeTypes: ['Administrator', 'Operator', 'ReadOnly', 'NoAccess'],
      originalUsername: '',
      form: {
        status: true,
        username: '',
        privilege: '',
        password: '',
        passwordConfirmation: ''
      }
    };
  },
  computed: {
    newUser() {
      return this.user ? false : true;
    }
  },
  watch: {
    user: function(value) {
      if (value === null) return;
      this.originalUsername = value.username;
      this.form.username = value.username;
      this.form.status = value.Enabled;
      this.form.privilege = value.privilege;
    }
  },
  validations: {
    form: {
      status: {
        required
      },
      username: {
        required,
        maxLength: maxLength(16),
        pattern: helpers.regex('pattern', /^([a-zA-Z_][a-zA-Z0-9_]*)/)
      },
      privilege: {
        required
      },
      password: {
        required: requiredIf(function() {
          return this.requirePassword();
        }),
        minLength: minLength(8), //TODO: Update to dynamic backend values
        maxLength: maxLength(20) //TODO: UPdate to dynamic backend values
      },
      passwordConfirmation: {
        required: requiredIf(function() {
          return this.requirePassword();
        }),
        sameAsPassword: sameAs('password')
      }
    }
  },
  methods: {
    handleSubmit() {
      let userData = {};

      if (this.newUser) {
        this.$v.$touch();
        if (this.$v.$invalid) return;
        userData.username = this.form.username;
        userData.status = this.form.status;
        userData.privilege = this.form.privilege;
        userData.password = this.form.password;
      } else {
        if (this.$v.$invalid) return;
        userData.originalUsername = this.originalUsername;
        if (this.$v.form.status.$dirty) {
          userData.status = this.form.status;
        }
        if (this.$v.form.username.$dirty) {
          userData.username = this.form.username;
        }
        if (this.$v.form.privilege.$dirty) {
          userData.privilege = this.form.privilege;
        }
        if (this.$v.form.password.$dirty) {
          userData.password = this.form.password;
        }
        if (Object.entries(userData).length === 1) {
          this.closeModal();
          return;
        }
      }

      this.$emit('ok', { isNewUser: this.newUser, userData });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.originalUsername = '';
      this.form.status = true;
      this.form.username = '';
      this.form.privilege = '';
      this.form.password = '';
      this.form.passwordConfirmation = '';
      this.$v.$reset();
    },
    requirePassword() {
      if (this.newUser) return true;
      if (this.$v.form.password.$dirty) return true;
      if (this.$v.form.passwordConfirmation.$dirty) return true;
      return false;
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    }
  }
};
</script>
