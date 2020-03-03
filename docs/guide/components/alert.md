# Alerts
An alert is an inline message that contains a short description that a user cannot manually dismiss. An example is the error alert displayed when a user enters an incorrect user name or password on the login page.

[Learn more about Bootstrap-vue alert options](https://bootstrap-vue.js.org/docs/components/alert)

<BmcAlerts />

```vue
<b-alert show variant="success">Success Alert</b-alert>
<b-alert show variant="warning">Warning Alert</b-alert>
<b-alert show variant="danger">
  <strong class="alert-title">Error</strong>
  <span>This is an error alert message.</span>
</b-alert>
<b-alert show variant="info">Info Alert</b-alert>
```