# Privileges

The UI hides actions the current session cannot perform. bmcweb still authorizes
every request. These checks are advisory.

Session role names come from `Session.Roles`. Privilege names come from
`AccountService/Roles` `AssignedPrivileges` when the BMC publishes that
resource. Until then, and when a role resource has no privileges, the UI uses
the defaults in `src/api/privilege/rolePrivileges.ts`.

## Standard roles

| Role          | Privileges                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| Administrator | Login, ConfigureManager, ConfigureUsers, ConfigureComponents, ConfigureSelf |
| Operator      | Login, ConfigureComponents, ConfigureSelf                                   |
| ReadOnly      | Login, ConfigureSelf                                                        |

## IBM service account

The predefined `service` user is not a DMTF role. Its RoleId is
`OemIBMServiceAgent` (also seen as `Oem.IBM.ServiceAgent` or `ServiceAgent`).
The account is in `priv-admin` and has the same privileges as Administrator,
including `ConfigureComponents`.

Firmware update is `UpdateService` POST, which requires `ConfigureComponents`.
The service account is allowed. ReadOnly is not. A missing role in the static
map used to leave this account with no privileges, so the Firmware page showed
"Insufficient Privileges".

`SystemAdministrator`, the IBM `admin` account role when it is not the DMTF
`Administrator` role, uses the same fallback.

## Checking an operation

Mappings live in `src/api/privilege/operationPrivileges.ts`. Add one when a page
starts gating that operation. The DMTF PrivilegeRegistry is not committed and is
not parsed at runtime.

```js
import { usePrivilegeCheckEntity } from '@/api/privilege/endpointPrivileges';

setup() {
  const firmwarePrivilege = usePrivilegeCheckEntity('UpdateService', 'POST');
  return { firmwarePrivilege };
}
```

`firmwarePrivilege.pending` is true until session roles are known.
`firmwarePrivilege.denied` is true only after that, when the session lacks the
required privileges. Do not treat a still-loading session as denied.

Routes and navigation with `exclusiveToRoles` match any entry in
`Session.Roles`, not only the first.

The design for this model is
https://gerrit.openbmc.org/c/openbmc/webui-vue/+/87153.
