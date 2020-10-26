# Page Anatomy
Single-file components (SFC) consist of a `template`, `script` and `style` block. When creating a new page, each template consists of at least 3 components:
- `b-container`
- `page-title`
- `page-section`
## Template block
Use the `fluid="xl"` prop on the `b-container` component to render a container that is always 100% width on larger screen sizes.
### Page title component
The `page-title` component receives its content from the `routes` configuration that corresponds with the component's name in the [scripts block(#scripts-block) of the SFC.
A block of text can be displayed below the page title by using the `:description` prop and passing in the localized text string.
### Page section component
The `page-section` component will render semantic HTMl. By a `:section-title` prop to the `page-section` component, the localized text string will be rendered in an `h2` header element.
```vue
<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageName.pageDescription')"/>
    <page-section :section-title="$t('pageName.sectionTitle')">
      // Page content goes here
    </page-section>
  </b-container>
</template>
```
## Scripts block
In the scripts section, be sure to import the `PageTitle` and `PageSection` components and declare them in the `components` property.
```vue
<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
export default {
  name: 'PageName',
  components: { PageTitle, PageSection }
};
</script>
```
## Style block
Add the `scoped` attribute to the style block to keep the styles isolated to the SFC.
```vue
<style lang="scss" scoped> </style>
```
## Complete single-file component (SFC)
The final SFC will look like this.
```vue
<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageName.pageDescription')"/>
    <page-section :section-title="$t('pageName.sectionTitle')">
      // Page content goes here
    </page-section>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
export default {
  name: 'PageName',
  components: { PageTitle, PageSection }
};
</script>
<style lang="scss" scoped> </style>
```