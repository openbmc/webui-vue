/**
 * Unit tests for spec-patching helpers in `scripts/redfish-spec-patch.ts`.
 * These run at codegen time only — no network or filesystem I/O.
 */

import { describe, expect, it } from 'vitest';

import {
  buildOperationName,
  cleanSchemaName,
  patchDanglingSchemaRefs,
  stampVersionedSchemaDescriptions,
  unlockSessionLoginFields,
} from '../../scripts/redfish-spec-patch';

describe('buildOperationName', () => {
  it('maps the service root to `ServiceRoot`', () => {
    expect(buildOperationName('/redfish/v1')).toBe('ServiceRoot');
    expect(buildOperationName('/redfish/v1/')).toBe('ServiceRoot');
  });

  it('keeps a plain collection segment as-is', () => {
    expect(buildOperationName('/redfish/v1/Systems')).toBe('Systems');
    expect(buildOperationName('/redfish/v1/Chassis')).toBe('Chassis');
    expect(buildOperationName('/redfish/v1/SessionService/Sessions')).toBe(
      'SessionServiceSessions',
    );
  });

  it('appends `ById` for trailing `{Id}` placeholders and singularises the parent', () => {
    expect(buildOperationName('/redfish/v1/Systems/{ComputerSystemId}')).toBe('SystemById');
    expect(buildOperationName('/redfish/v1/Chassis/{ChassisId}')).toBe('ChassisById');
    expect(buildOperationName('/redfish/v1/AccountService/Accounts/{ManagerAccountId}')).toBe(
      'AccountServiceAccountById',
    );
  });

  it('drops intermediate `{Id}` placeholders', () => {
    expect(buildOperationName('/redfish/v1/Chassis/{ChassisId}/Power')).toBe('ChassisPower');
    expect(buildOperationName('/redfish/v1/Systems/{ComputerSystemId}/LogServices')).toBe(
      'SystemLogServices',
    );
  });

  it('flattens the trailing `Actions/<Action>.<Verb>` segment', () => {
    expect(
      buildOperationName('/redfish/v1/Systems/{ComputerSystemId}/Actions/ComputerSystem.Reset'),
    ).toBe('SystemReset');
    expect(
      buildOperationName('/redfish/v1/EventService/Actions/EventService.SubmitTestEvent'),
    ).toBe('EventServiceSubmitTestEvent');
  });
});

describe('cleanSchemaName', () => {
  it('collapses the canonical `Foo_v1_2_3_Foo` repetition', () => {
    expect(cleanSchemaName('Chassis_v1_18_0_Chassis')).toBe('Chassis');
    expect(cleanSchemaName('ComputerSystem_v1_22_0_ComputerSystem')).toBe('ComputerSystem');
  });

  it('preserves a non-repeating suffix after the version segment', () => {
    expect(cleanSchemaName('ComputerSystem_v1_22_0_BootProperty')).toBe(
      'ComputerSystemBootProperty',
    );
  });

  it('iterates on nested versioned segments until a fixpoint', () => {
    expect(cleanSchemaName('ComputerSystem_v1_22_0_ComputerSystem_v1_22_0_BootProperty')).toBe(
      'ComputerSystemBootProperty',
    );
  });

  it('leaves unrelated names untouched', () => {
    expect(cleanSchemaName('RedfishError')).toBe('RedfishError');
    expect(cleanSchemaName('Status')).toBe('Status');
  });
});

describe('unlockSessionLoginFields', () => {
  it('drops `readOnly` from login fields on `Session_v*` schemas', () => {
    const spec = {
      components: {
        schemas: {
          Session_v1_5_0_Session: {
            properties: {
              Description: { readOnly: true, type: 'string' },
              Password: { readOnly: true, type: 'string' },
              Token: { readOnly: true, type: 'string' },
              UserName: { readOnly: true, type: 'string' },
            },
          },
        },
      },
    };

    unlockSessionLoginFields(spec as unknown as Record<string, unknown>);

    const props = (spec.components.schemas.Session_v1_5_0_Session.properties ?? {}) as Record<
      string,
      { readOnly?: boolean }
    >;
    expect(props.UserName?.readOnly).toBeUndefined();
    expect(props.Password?.readOnly).toBeUndefined();
    expect(props.Token?.readOnly).toBeUndefined();
    expect(props.Description?.readOnly).toBe(true);
  });

  it('only touches schemas whose name starts with `Session_v`', () => {
    const spec = {
      components: {
        schemas: {
          AccountService_v1_0_0: {
            properties: {
              UserName: { readOnly: true, type: 'string' },
            },
          },
        },
      },
    };
    unlockSessionLoginFields(spec as unknown as Record<string, unknown>);
    const props = spec.components.schemas.AccountService_v1_0_0.properties as Record<
      string,
      { readOnly?: boolean }
    >;
    expect(props.UserName?.readOnly).toBe(true);
  });

  it('is a no-op when components/schemas are missing', () => {
    const spec: Record<string, unknown> = {};
    expect(() => unlockSessionLoginFields(spec)).not.toThrow();
    expect(spec).toEqual({});
  });
});

describe('patchDanglingSchemaRefs', () => {
  it('inserts an empty-object stub for every dangling `$ref`', () => {
    const spec = {
      components: {
        schemas: {
          KnownSchema: { type: 'object' },
        },
      },
      paths: {
        '/redfish/v1/Foo': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/MissingSchema' },
                  },
                },
              },
            },
          },
        },
      },
    };

    patchDanglingSchemaRefs(spec as unknown as Record<string, unknown>);

    const schemas = spec.components.schemas as Record<string, unknown>;
    expect(schemas.KnownSchema).toEqual({ type: 'object' });
    expect(schemas.MissingSchema).toEqual({ type: 'object' });
  });

  it('does not overwrite a schema that already exists', () => {
    const spec = {
      components: {
        schemas: {
          ExistingSchema: { properties: { foo: { type: 'string' } }, type: 'object' },
        },
      },
      paths: {
        '/foo': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ExistingSchema' },
                  },
                },
              },
            },
          },
        },
      },
    };

    patchDanglingSchemaRefs(spec as unknown as Record<string, unknown>);

    expect(spec.components.schemas.ExistingSchema).toEqual({
      properties: { foo: { type: 'string' } },
      type: 'object',
    });
  });

  it('inline-stubs unresolved external http(s) `$ref`s left after bundle', () => {
    const spec = {
      paths: {
        '/redfish/v1/Sensors/{SensorId}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: 'http://redfish.dmtf.org/schemas/v1/Sensor.yaml#/components/schemas/Sensor_SensorLowerCriticalExcerpt',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    patchDanglingSchemaRefs(spec as unknown as Record<string, unknown>);

    const schema = spec.paths['/redfish/v1/Sensors/{SensorId}'].get.responses[200].content[
      'application/json'
    ].schema as Record<string, unknown>;
    expect(schema.$ref).toBeUndefined();
    expect(schema.type).toBe('object');
  });

  it('inline-stubs unresolved relative external file `$ref`s left after bundle', () => {
    const spec = {
      paths: {
        '/redfish/v1/Sensors/{SensorId}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: 'Sensor.yaml#/components/schemas/Sensor_SensorLowerCriticalExcerpt',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    patchDanglingSchemaRefs(spec as unknown as Record<string, unknown>);

    const schema = spec.paths['/redfish/v1/Sensors/{SensorId}'].get.responses[200].content[
      'application/json'
    ].schema as Record<string, unknown>;
    expect(schema.$ref).toBeUndefined();
    expect(schema.type).toBe('object');
  });

  it('leaves internal non-schema `$ref`s (e.g. parameters) untouched', () => {
    const spec = {
      components: { schemas: {} },
      paths: {
        '/redfish/v1/Systems': {
          get: {
            parameters: [{ $ref: '#/components/parameters/RedfishQueryParam__expand' }],
          },
        },
      },
    };

    patchDanglingSchemaRefs(spec as unknown as Record<string, unknown>);

    const param = spec.paths['/redfish/v1/Systems'].get.parameters[0] as Record<string, unknown>;
    expect(param.$ref).toBe('#/components/parameters/RedfishQueryParam__expand');
    expect(param.type).toBeUndefined();
  });

  it('handles cyclic references without infinite-looping', () => {
    const cycle: Record<string, unknown> = { name: 'cycle' };
    cycle.self = cycle;

    const spec = {
      components: { schemas: {} },
      cycle,
    };

    expect(() => patchDanglingSchemaRefs(spec as unknown as Record<string, unknown>)).not.toThrow();
  });
});

describe('stampVersionedSchemaDescriptions', () => {
  it('appends `@version X.Y.Z` to versioned schema descriptions', () => {
    const spec = {
      components: {
        schemas: {
          Chassis_v1_18_0_Chassis: { description: 'A chassis.' },
          ComputerSystem_v1_22_0_BootProperty: {},
          UnversionedHelper: { description: 'No version stamp expected.' },
        },
      },
    };

    stampVersionedSchemaDescriptions(spec as unknown as Record<string, unknown>);

    const schemas = spec.components.schemas as Record<string, { description?: string }>;
    expect(schemas.Chassis_v1_18_0_Chassis?.description).toBe('A chassis.\n@version 1.18.0');
    expect(schemas.ComputerSystem_v1_22_0_BootProperty?.description).toBe('@version 1.22.0');
    expect(schemas.UnversionedHelper?.description).toBe('No version stamp expected.');
  });

  it('is a no-op when components/schemas are missing', () => {
    const spec: Record<string, unknown> = {};
    expect(() => stampVersionedSchemaDescriptions(spec)).not.toThrow();
    expect(spec).toEqual({});
  });
});
