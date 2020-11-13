# StatusIcon

The StatusIcon component is used to add an icon that represents one of the following statuses:

1. Success
2. Info
3. Warning
4. Danger

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

## Status icon with success status

```vue
<status-icon
:status="success"
/>
```

![StatusIcon success icon example](./success.png)

## Status icon with info status

```vue
<status-icon
:status="info"
/>
```

![StatusIcon info icon example](./info.png)

## Status icon with warning status

```vue
<status-icon
:status="warning"
/>
```

![StatusIcon warning icon example](./warning.png)

## Status icon with danger status

```vue
<status-icon
:status="danger"
/>
```

![StatusIcon danger icon example](./danger.png)

### Optional property

- `status` - on the basis of status value respective icon will be visible
