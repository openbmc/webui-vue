# StatusIcon

The StatusIcon component is used to add an icon that represents one of the following statuses:

1. danger
2. info
3. warning
4. success

To use this component:
1. Import it into the single file component (SFC)
2. Add the status-icon tag
3. Add the optional status prop and set the value to one of the statuses.
3. Add the translated text to associate with the icon

```vue
import StatusIcon from '@/components/Global/StatusIcon'
```

## Status icon with default status

```vue
<status-icon />
```

![StatusIcon default icon example](./secondary.png)

## Status icon with info status

```vue
<status-icon
:status="info"
/>
```

<img :src="$withBase('info.png')" alt="Info icon" style="max-width:40px; height:40px">

## Status icon with success status

```vue
<status-icon
:status="success"
/>
```

<img :src="$withBase('./success.png')" alt="Success icon" style="max-width:40px; height:40px">

## Status icon with warning status

```vue
<status-icon
:status="warning"
/>
```

<img :src="$withBase('./warning.png')" alt="Warning icon" style="max-width:40px; height:40px">

## Status icon with danger status

```vue
<status-icon
:status="danger"
/>
```

<img :src="$withBase('./danger.png')" alt="Danger icon example" style="max-width:40px; height:40px">

### Optional property

- `status` - on the basis of status value respective icon will be visible
