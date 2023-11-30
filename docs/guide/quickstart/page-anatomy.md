# Page Anatomy

Single-file components (SFC) consist of a `template`, `script` and `style`
block.

## Template block

When creating a new page, each template consists of at least 3 components:

- `<BContainer>`
- `<page-title>`
- `<page-section>`

Learn more about the [page title](/guide/components/page-title)and
[page section](/guide/components/page-section) components.

```vue
<template>
  <BContainer fluid="xl">
    <page-title />
    <page-section :section-title="t('pageName.sectionTitle')">
      // Page content goes here
    </page-section>
  </BContainer>
</template>
```

## Scripts block

In the scripts section, be sure to import the `PageTitle` and `PageSection`
components and declare them in the `components` property.

Importing `BContainer` in the [scripts block](#scripts-block) is not required as
it is already registered globally.

```vue
<script setup>
import PageTitle from '@/components/Global/PageTitle.vue';
import PageSection from '@/components/Global/PageSection.vue';
</script>
```

## Style block

Add the `scoped` attribute to the style block to keep the styles isolated to the
SFC. While the `scoped` attribute is optional, it is preferred and global
changes should be done in global style sheets.

```vue
<style lang="scss" scoped></style>
```

## Complete single-file component (SFC)

The final SFC will look like this.

```vue
<template>
  <BContainer fluid="xl">
    <page-title :description="t('pageName.pageDescription')" />
    <page-section :section-title="t('pageName.sectionTitle')">
      // Page content goes here
    </page-section>
  </BContainer>
</template>
<script setup>
import PageTitle from '@/components/Global/PageTitle.vue';
import PageSection from '@/components/Global/PageSection.vue';
</script>
<style lang="scss" scoped>
.example-class {
  /* Styles go here */
}
</style>
```
