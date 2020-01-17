# webui-vue

webui-vue is a web-based user interface for the OpenBMC firmware stack built on
[Vue.js](https://vuejs.org/).

### Hold on... I thought [phosphor-webui](https://github.com/openbmc/phosphor-webui) was the web user interface being used?

It is, but phosphor-webui is built on AngularJS and
[AngularJS goes End of Life](https://www.convective.com/angularjs-end-of-life/)
June 30, 2021, so this repository is hopefully its replacement. At this time,
phosphor-webui still contains more features and you should consider using it.

### When will this new Vue.js application reach feature parity with phosphor-webui?

The current plan is by June 2020!

### Why will this application be better?

As mentioned, this application is built on Vue.js, a very popular javascript
framework. This application is built from the beginning to allow for easy
theming and does not suffer from some of the anti-patterns that plagued
phosphor-webui.

### How can I get involved?

Visit the [CONTRIBUTING.md](CONTRIBUTING.md) for more on how to contribute code,
review some code in
[Gerrit](https://gerrit.openbmc-project.xyz/q/project:openbmc%252Fwebui-vue+status:open),
or join us in the
[GUI design workgroup meeting](https://github.com/openbmc/openbmc/wiki/GUI-Design-work-group).
