# Alerts
An alert is an inline message that contains a short description that a user cannot manually dismiss. With exception to the error message on the login page, alerts are not triggered by user action. Success and error notifications based on user actions are created using a toast component.

[Learn more about Bootstrap-vue alert options](https://bootstrap-vue.js.org/docs/components/alert)

<BmcAlerts />

```vue
<alert :show="true" variant="warning">This is a warning message</alert>
<alert :show="true" variant="danger">This is an error message</alert>
<alert :show="true" variant="info">This is an info message</alert>
<alert
  :show="true"
  title="Error"
  variant="danger">
  This is an error message with a titile. An edge case used on the login page.
</alert>
```