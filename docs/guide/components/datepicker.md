# Datepicker

All datepickers in the application are using the [BoostrapVue datepicker component](https://bootstrap-vue.org/docs/components/form-datepicker).

To use this component, include the `<b-form-datepicker>` tag in the template after `<b-form-input>` along with `<b-form-group>` and `<b-input-group>`. The component is registered globally so does not need to be imported in each SFC.

## Basic Datepicker
There are few required properties that can use to maintain consistency across the application. The full list of options can be viewed on the [Bootstrap-vue datepicker component's documentation page](https://bootstrap-vue.org/docs/components/form-datepicker#comp-ref-b-form-datepicker).

### Required properties
- `button-only` - renders button with calendar icon.
- `right` - align the right edge of the menu with the right of the button.
- `min` - the minimum date the calendar will show.
- `max` - the maximum date the calendar will show.
- `label-help` - help text that appears at the bottom of the calendar grid

<br/>

```vue
// Sample code that shows the block of Datepicker
<b-form-datepicker
    v-model="toDate"
    class="input-action"
    button-only
    right
    :min="fromDate"
    :hide-header="true"
    :locale="locale"
    :label-help="$t('global.calendar.useCursorKeysToNavigateCalendarDates')"
    button-variant="link"
    aria-controls="input-to-date"
>
    <template #button-content>
        <icon-calendar
            :title="$t('global.calendar.openDatePicker')"
            aria-hidden="true"
        />
        <span class="sr-only">{{$t('global.calendar.openDatePicker')}}</span>
    </template>
</b-form-datepicker>
```