# Presentation Layer Architecture

This section discusses the structure and purpose of the SCSS files and how to
customize the application using Bootstrap theming.

[Read more about Bootstrap
Theming](https://getbootstrap.com/docs/4.0/getting-started/theming)

## SCSS Directory Structure

### `bmc` Directory

The `bmc` directory contains Sass helpers and default styles for customizing the OpenBMC
Web UI.

```{5}
.
├─ src
   ├─ assets
      ├─ styles
         ├─ bmc
            ├─ custom
            └─ helpers
         ├─ bootstrap
         └─ _obmc-custom.scss
```

### `custom` Directory

The `custom` Directory imports all the styles needed to customize the UI. These
are small changes used to reach parity with the OpenBMC Design Workgroup's
agreed-upon design. The file naming convention closely follows the Bootstrap or
Boostrap-vue library file naming since most of the ruleset selectors in these
files are based on these two libraries.

```{6}
.
├─ src
   ├─ assets
      ├─ styles
         ├─ bmc
            ├─ custom
               ├─ alert.scss
               ├─ _badge.scss
               ├─ _base.scss
               ├─ _bootstrap-grid.scss
               ├─ _buttons.scss
               ├─ _calendar.scss
               ├─ _card.scss
               ├─ _dropdown.scss
               ├─ _forms.scss
               ├─ _index.scss
               ├─ _kvm.scss
               ├─ _modal.scss
               ├─ _pagination.scss
               ├─ _sol.scss
               ├─ _tables.scss
               └─ _toasts.scss
         ├─ helpers
         ├─ bootstrap
         └─ _obmc-custom.scss
```

### `helpers` Directory

The `helpers` directory contains a set of Sass helper files containing Sass
variables that establish the custom theme of the application.

```{6}
.
├─ src
   ├─ assets
      ├─ styles
         ├─ bmc
         ├─ helpers
                ├─ _colors.scss
                ├─ _functions.scss
                ├─ _index.scss
                ├─ _motion.scss
                └─ _variables.scss
         ├─ bootstrap
         └─ _obmc-custom.scss
```

#### `_colors.scss`

The `_colors.scss` file sets all the SASS variables and color maps for the OpenBMC
Web UI. Any color settings needed to meet company brand guidelines will happen
in this file.

##### Sass Color Variables

```scss
$black: #000;
$white: #fff;

$blue-500: #2d60e5;
$green-500: #0a7d06;
$red-500: #da1416;
$yellow-500: #efc100;

$gray-100: #f4f4f4;
$gray-200: #e6e6e6;
$gray-300: #d8d8d8;
$gray-400: #cccccc;
$gray-500: #b3b3b3;
$gray-600: #999999;
$gray-700: #666666;
$gray-800: #3f3f3f;
$gray-900: #161616;
```

##### Custom Color Variables

```scss
// Sass Base Color Variables
$blue: $blue-500;
$green: $green-500;
$red: $red-500;
$yellow: $yellow-500;
```

##### Custom Colors Map

```scss
$colors: (
  "blue": $blue,
  "green": $green,
  "red": $red,
  "yellow": $yellow,
);
```

##### Custom Theme Color Variables

```scss
// Sass Theme Color Variables
// Can be used as variants
$danger: $red;
$dark: $gray-900;
$info: $blue;
$light: $gray-100;
$primary: $blue;
$secondary: $gray-800;
$success: $green;
$warning: $yellow;
```

##### Custom Theme Colors Map

```scss
$theme-colors: (
  "primary": $primary,
  "secondary": $secondary,
  "dark": $dark,
  "light": $light,
  "danger": $danger,
  "info": $info "success": $success "warning": $warning,
);
```

##### Color Resources

- [Learn more about Bootstrap
  colors](https://getbootstrap.com/docs/4.0/getting-started/theming/#color)
- [Learn more about Bootstrap
  variables](https://getbootstrap.com/docs/4.0/getting-started/theming/#css-variables)
- [View the color palette and hex values in the color
  guidelines](/guide/guidelines/colors)

#### `_functions.scss`

Two functions provide a customized way to set color highlights. The
`theme-color-light` and `theme-color-dark` are custom functions used to create
colors for the `alert`, `badge`, `card`, and `toast` components. They have also
set color highlights for some pseudo-elements like `: hover`.

##### Functions

```scss
// This function is usually used to get a lighter
// theme variant color to use as a background color
@function theme-color-light($variant) {
  @return theme-color-level($variant, -11.3);
}

@function theme-color-dark($variant) {
  @return theme-color-level($variant, 2);
}
```

##### Examples

```scss{8-10,16}
.b-table-sort-icon-left {
    background-position: left calc(1.5rem / 2) center !important;
    padding-left: calc(1.2rem + 0.65em) !important;
    &:focus {
      outline: none;
      box-shadow: inset 0 0 0 2px theme-color('primary') !important;
    }
    &:hover {
      background-color: theme-color-dark('light');
    }
  }
}

&.alert-info {
border-left-color: theme-color("info");
background-color: theme-color-light("info");
fill: theme-color("info");
}
```

#### `_motion.scss`

This bezier curves and durations in this file determine the motion styles
throughout the application. These guidelines from the Cabon Design System avoid
easing curves that are unnatural, distracting, or purely decorative.

##### Motion Styles

```scss
$duration--fast-01: 70ms; //Micro-interactions such as button and toggle
$duration--fast-02: 110ms; //Micro-interactions such as fade
$duration--moderate-01: 150ms; //Micro-interactions, small expansion, short distance movements
$duration--moderate-02: 240ms; //Expansion, system communication, toast
$duration--slow-01: 400ms; //Large expansion, important system notifications
$duration--slow-02: 700ms; //Background dimming

$standard-easing--productive: cubic-bezier(0.2, 0, 0.38, 0.9);
$standard-easing--expressive: cubic-bezier(0.4, 0.14, 0.3, 1);
$entrance-easing--productive: cubic-bezier(0, 0, 0.38, 0.9);
$entrance-easing--expressive: cubic-bezier(0, 0, 0.3, 1);
$exit-easing--productive: cubic-bezier(0.2, 0, 1, 0.9);
$exit-easing--expressive: cubic-bezier(0.4, 0.14, 1, 1);
```

##### Example

```scss{6,9}
.link-skip-nav {
  position: absolute;
  top: -60px;
  left: 0.5rem;
  z-index: $zindex-popover;
  transition: $duration--moderate-01 $exit-easing--expressive;
  &:focus {
    top: 0.5rem;
    transition-timing-function: $entrance-easing--expressive;
  }
}
```

##### Motion Resources

- [Including Animation In Your Design
  System](https://www.smashingmagazine.com/2019/02/animation-design-system/)
- [Carbon Design System motion
  guidelines](https://www.carbondesignsystem.com/guidelines/motion/basics/)

#### `_variables.scss`

This file contains all the global Sass options. There are Bootstrap option
overrides, Bootstrap global variable overrides, and custom BMC global variables.
Read more about these in the [Customization section](/customize/theme).

### `bootstrap` Directory

The `bootstrap` directory contains all the import references. The references are
split into multiple files to support import order based on dependency. Helper
styles need to be imported before all other styles.

```{6}
.
├─ src
   ├─ assets
      ├─ styles
         ├─ bmc
         ├─ bootstrap
            ├─ _helpers.scss
            └─ _index.scss
         └─ _obmc-custom.scss
```

#### `_helpers.scss`

This file contains all the helper import references for Bootstrap.

#### `_index.scss`

This file contains all the import references needed to support the base,
components, and utility styles.

### `_obmc-custom.scss`

```{9}
.
├─ src
   ├─ assets
      ├─ styles
         ├─ bmc
         ├─ bootstrap
         └─ _obmc-custom.scss
```

The `obmc-custom.scss` file defines all of the presentational layer
dependencies.

- [Read more about Bootstrap
  options](https://getbootstrap.com/docs/4.0/getting-started/theming/#sass-options)
- [Read more about
  Importing](https://getbootstrap.com/docs/4.0/getting-started/theming/#importing)

## Component / View Styles

Some stylistic changes only apply to a single-file component or view instance.
In this case, rather than adding a Sass file, the scoped styles include the
styles in the component's `<style>` block. It is required to import the
`_helpers` Sass file when using a BMC or Bootstrap variable in the component's
`<style>` block. Without this import, webpack cannot compile the OpenBMC Web UI
CSS styles correctly.

### Scoped style block using SASS

```html
<style scoped lang="scss">
  ...
</style>
```

### Scoped style block using CSS

```html
<style scoped>
  ...;
</style>
```

### Example - PageSection.vue

```html
<style lang="scss" scoped>
  .page-section {
    margin-bottom: $spacer * 2;
  }

  h2 {
    @include font-size($h3-font-size);
    margin-bottom: $spacer;
    &::after {
      content: "";
      display: block;
      width: 100px;
      border: 1px solid $gray-300;
      margin-top: 10px;
    }
  }
</style>
```

:::tip
You might notice that there is an HTML element, `<h2>`, used in the example. This is an anti-pattern in global `.scss` files. However, in a single file component that generates the markup it is acceptable.
:::

[Learn more about single file components](https://vuejs.org/v2/guide/single-file-components.html)

Customization of the application requires knowledge of Sass and CSS. It also
will require becoming familiar with the Bootstrap and Bootstrap-Vue component
libraries. This section outlines the global options and variables that can be
removed or updated to meet organizational brand guidelines.
