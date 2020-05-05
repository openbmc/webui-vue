
# Overview

The best way to change the overall look and feel of the OpenBMC Web UI is to update the following files in a downstream repository. This section discusses the structure and purpose of the theme files and how to customize the application using Boostrap theming.

[Read more about Boostrap Theming](https://getbootstrap.com/docs/4.0/getting-started/theming)


## SCSS File Structure
```
.
├─ src
   ├─ assets
      ├─ styles
         ├─ bmc
            └─ helpers
         ├─ vendor
            ├─ bootstrap
            └─ bootstrap-vue
         ├─ vendor-overrides
            └─ bootstrap
         ├─ _helpers.scss
         └─ _obmc-custom.scss
```

## bmc
This folder contains Sass helpers and default styles for customizing the OpenBMC Web UI.

```
.
├─ src
   ├─ assets
      ├─ styles
         ├─ bmc
            ├─ helpers
               ├─ _colors.scss
               ├─ _motion.scss
               └─ _variables.scss
            ├─ _helpers.scss
            └─ _base.scss
```

### helpers
The helper's folder contains a set of Sass helper files containing Sass variables that establish the custom theme of the application.

#### _colors.scss
The colors.scss file sets all the SASS variables and color maps for the OpenBMC Web UI. Any color settings needed to meet company brand guidelines will happen in this file.

##### Sass Color Variables
```scss
$black: #000;
$white: #fff;

$blue-100: #eff2fb;
$blue-500: #2d60e5;

$green-100: #ecfdf1;
$green-500: #0a7d06;

$red-100: #feeeed;
$red-500: #da1416;

$yellow-100: #fff8e4;
$yellow-500: #efc100;

$gray-100: #fafafa;
$gray-200: #f4f4f4;
$gray-300: #dcdee0;
$gray-400: #ccc;
$gray-500: #b3b3b3;
$gray-600: #999999;
$gray-700: #666666;
$gray-800: #333333;
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

// Sass Color Variable Accents
// Used for component styles and are
// not available as variants
$danger-light: $red-100;
$info-light: $blue-100;
$warning-light: $yellow-100;
$success-light: $green-100;
```

##### Custom Theme Colors Map
```scss
$theme-colors: (
  "primary": $primary,
  "secondary": $secondary,
  "dark": $dark,
  "light": $light,
  "danger": $danger,
  "info": $info
  "success": $success
  "warning": $warning,
);
```

##### Color Resources
- [Learn more about Boostrap colors](https://getbootstrap.com/docs/4.0/getting-started/theming/#color)
- [Leran more about Bootstrap variables](https://getbootstrap.com/docs/4.0/getting-started/theming/#css-variables)
- [View the color palette and hex values in the color guidelines](/guide/guidelines/colors)

#### _motion.scss
This bezier curves and durations in this file determine the motion styles throughout the application. These guidelines from the Cabon Design System avoid easing curves that are unnatural, distracting, or purely decorative.

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
```scss
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
- [Including Animation In Your Design System](https://www.smashingmagazine.com/2019/02/animation-design-system/)
- [Carbon Design System motion guidelines](https://www.carbondesignsystem.com/guidelines/motion/basics/)

#### _variables.scss
This file contains all the global Sass options. There are Bootstrap option overrides, Bootstrap global variable overrides, and custom BMC global variables. Read more about these in the [theme customization section](/themes/customize).

## vendor
The `vendor` directory imports all third-party styles needed to support the OpenBMC Web UI. These imports are split into separate directories to import the files based on their dependency order.

```
.
├─ src
   ├─ assets
      ├─ styles
         ├─ vendor
            ├─ bootstrap
               ├─ _base.scss
               ├─ _components.scss
               ├─ _helpers.scss
               └─ _index.scss
            └─ bootstrap-vue
               └─ _index.scss
```

## vendor-override
The `vendor-override` directory imports all third-party style overrides. These are small changes used to reach parity with the OpenBMC Design Workgroup's agreed-upon design. Each of these files uses the same file naming as the Bootstrap Sass files the override. One exception to this rule is the `index` Sass file used to simplify the file import structure of the `obmc-custom` Sass file.
```
.
├─ src
   ├─ assets
      ├─ styles
         ├─ vendor-overrides
            ├─ bootstrap
               ├─ _alert.scss
               ├─ _badge.scss
               ├─ _buttons.scss
               ├─ _forms.scss
               ├─ _index.scss
               ├─ _modal.scss
               ├─ _tables.scss
               └─ _toasts.scss
```

### _helpers.scss
The `_helpers.scss` file is an import file needed when building single-file components that require the use of BMC or Bootstrap Sass variables and functions. This file needs to be imported as part of the `<style>` block to support Sass compilation. Although it is possible to prepend these helpers in webpack, it will break any use of imported single-file components used in the Vuepress documentation.

### _obmc-custom.scss
The `obmc-custom.scss` file defines all of the presentational layer dependencies.

- [Read more about Boostrap options](https://getbootstrap.com/docs/4.0/getting-started/theming/#sass-options)
- [Read more about Importing](https://getbootstrap.com/docs/4.0/getting-started/theming/#importing)

## Component / View Styles

Some stylistic changes only apply to a single-file component or view instance. In this case, rather than adding a Sass file, the scoped styles include the styles in the component's `<style>` block. It is required to import the `_helpers` Sass file when using a BMC or Bootstrap variable in the component's `<style>` block. Without this import, webpack cannot  compile the OpenBMC Web UI CSS styles correctly.


### Scoped style block using SASS
```html
<style scoped lang="scss">
  ...
</style>
```

### Scoped style block using CSS
```html
<style scoped>
  ...
</style>
```

### Example - PageSection.vue
```html
<style lang="scss" scoped>
.page-section {
  margin-bottom: $spacer * 2;
}

h2 {
  @include font-size($h4-font-size);
  margin-bottom: $spacer;
  &::after {
    content: '';
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



