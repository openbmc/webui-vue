/**
 * Redfish type definitions
 * These mirror the Redfish schema and preserve PascalCase property names
 */

/**
 * Redfish Status object
 */
export interface RedfishStatus {
  State?: string;
  Health?: string;
  HealthRollup?: string;
}

/**
 * Redfish Sensor Thresholds
 */
export interface SensorThresholds {
  LowerCritical?: {
    Reading?: number;
    Activation?: string;
  };
  LowerCaution?: {
    Reading?: number;
    Activation?: string;
  };
  UpperCaution?: {
    Reading?: number;
    Activation?: string;
  };
  UpperCritical?: {
    Reading?: number;
    Activation?: string;
  };
}

/**
 * Redfish Sensor resource
 * Preserves Redfish property names (PascalCase)
 */
export interface Sensor {
  '@odata.id': string;
  '@odata.type': string;
  Id: string;
  Name: string;
  Status?: RedfishStatus;
  Reading?: number;
  ReadingUnits?: string;
  ReadingType?: string;
  Thresholds?: SensorThresholds;
  // Legacy properties for backward compatibility
  ReadingCelsius?: number;
  ReadingVolts?: number;
  LowerThresholdNonCritical?: number;
  UpperThresholdNonCritical?: number;
  LowerThresholdCritical?: number;
  UpperThresholdCritical?: number;
}

/**
 * Redfish Memory resource
 */
export interface Memory {
  '@odata.id': string;
  '@odata.type': string;
  Id: string;
  Name: string;
  Status?: RedfishStatus;
  CapacityMiB?: number;
  MemoryDeviceType?: string;
  Manufacturer?: string;
  PartNumber?: string;
  SerialNumber?: string;
}

/**
 * Redfish Drive resource
 */
export interface Drive {
  '@odata.id': string;
  '@odata.type': string;
  Id: string;
  Name: string;
  Status?: RedfishStatus;
  CapacityBytes?: number;
  MediaType?: string;
  Manufacturer?: string;
  Model?: string;
  SerialNumber?: string;
  Protocol?: string;
}

/**
 * Redfish Processor resource
 */
export interface Processor {
  '@odata.id': string;
  '@odata.type': string;
  Id: string;
  Name: string;
  Status?: RedfishStatus;
  ProcessorType?: string;
  ProcessorArchitecture?: string;
  InstructionSet?: string;
  Manufacturer?: string;
  Model?: string;
  MaxSpeedMHz?: number;
  TotalCores?: number;
  TotalThreads?: number;
}

/**
 * Redfish PowerLimitWatts (EnvironmentMetrics)
 */
export interface PowerLimitWatts {
  SetPoint?: number;
  AllowableMin?: number;
  AllowableMax?: number;
  ControlMode?: string;
}

export interface EnvironmentMetrics {
  '@odata.id': string;
  '@odata.type'?: string;
  Id?: string;
  Name?: string;
  PowerLimitWatts?: PowerLimitWatts;
  PowerWatts?: { Reading?: number };
}

/**
 * Redfish Chassis resource
 */
export interface Chassis {
  '@odata.id': string;
  '@odata.type': string;
  Id: string;
  Name: string;
  ChassisType?: string;
  Manufacturer?: string;
  Model?: string;
  SerialNumber?: string;
  PartNumber?: string;
  Status?: RedfishStatus;
  Sensors?: { '@odata.id': string };
  Thermal?: { '@odata.id': string };
  Power?: { '@odata.id': string };
  PowerSubsystem?: { '@odata.id': string };
  EnvironmentMetrics?: { '@odata.id': string };
}

/**
 * Redfish System resource
 */
export interface System {
  '@odata.id': string;
  '@odata.type': string;
  Id: string;
  Name: string;
  SystemType?: string;
  Manufacturer?: string;
  Model?: string;
  SerialNumber?: string;
  PartNumber?: string;
  Status?: RedfishStatus;
  PowerState?: string;
  BiosVersion?: string;
  Memory?: { '@odata.id': string };
  Processors?: { '@odata.id': string };
}
