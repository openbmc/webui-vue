# Datepicker

All datepickers in the application are using the [BoostrapVue datepicker component](https://bootstrap-vue.org/docs/components/form-datepicker).

To use this component, include the `<b-form-datepicker>` tag in the template after `<b-form-input>` along with `<b-form-group>` and `<b-input-group>`. The component is registered globally so does not need to be imported in each SFC.

## Basic Datepicker
There are few required properties that can use to maintain consistency across the application. The full list of options can be viewed on the [Bootstrap-vue datepicker component's documentation page](https://bootstrap-vue.org/docs/components/form-datepicker#comp-ref-b-form-datepicker).

### Required properties
- `button-only` *(required)* - renders button with calendar icon.
- `right` *(required)* - align the right edge of the menu with the right of the button.
- `min` *(required)* - the minimum date the calendar will show.
- `max` *(required)* - the maximum date the calendar will show.
- `label-help` *(required)* - help text that appears at the bottom of the calendar grid

<br/>