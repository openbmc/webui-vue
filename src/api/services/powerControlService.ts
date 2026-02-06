import api from '@/store/api';
import i18n from '@/i18n';

export interface PowerControlData {
  powerCapValue: number | null;
  powerCapMin: number | null;
  powerCapMax: number | null;
  powerControlMode: string | null;
  powerCapUri: string;
  powerConsumptionValue: number | null;
}

export interface SetPowerControlParams {
  powerCapUri: string;
}

/**
 * Fetches chassis collection URIs from Redfish
 */
export async function getChassisCollection(): Promise<string[]> {
  const response = await api.get<{ Chassis?: { '@odata.id': string } }>(
    '/redfish/v1/',
  );
  const chassisRef = response.data.Chassis?.['@odata.id'];
  if (!chassisRef) return [];
  const { data } = await api.get<{ Members?: { '@odata.id': string }[] }>(
    chassisRef,
  );
  const members = data.Members ?? [];
  return members.map((member) => member['@odata.id']);
}

/**
 * Fetches power control data (environment metrics) for the first chassis
 */
export async function getPowerControl(): Promise<PowerControlData | null> {
  const collection = await getChassisCollection();
  if (!collection?.length) return null;

  const chassisResponse = await api.get<{
    EnvironmentMetrics?: { '@odata.id': string };
  }>(collection[0]);
  const powerUri = chassisResponse?.data?.EnvironmentMetrics?.['@odata.id'];
  if (!powerUri) return null;

  const response = await api.get<{
    '@odata.id'?: string;
    PowerLimitWatts?: {
      SetPoint?: number;
      AllowableMin?: number;
      AllowableMax?: number;
      ControlMode?: string;
    };
    PowerWatts?: { Reading?: number };
  }>(powerUri);
  const data = response.data;
  const powerLimit = data?.PowerLimitWatts ?? {};

  return {
    powerCapValue: powerLimit.SetPoint ?? null,
    powerCapMin: powerLimit.AllowableMin ?? null,
    powerCapMax: powerLimit.AllowableMax ?? null,
    powerControlMode: powerLimit.ControlMode ?? null,
    powerCapUri: data?.['@odata.id'] ?? '',
    powerConsumptionValue: data?.PowerWatts?.Reading ?? null,
  };
}

/**
 * Updates power cap (SetPoint) and ControlMode via Redfish PATCH
 * @param controlMode - "Disabled" when power cap is off, "Automatic" when enabled
 */
export async function setPowerControl(
  params: SetPowerControlParams,
  powerCapValue: number,
  controlMode: 'Disabled' | 'Automatic',
): Promise<string> {
  const payload = {
    PowerLimitWatts: {
      ControlMode: controlMode,
      SetPoint: powerCapValue,
    },
  };
  await api.patch(params.powerCapUri, payload);
  return i18n.global.t('pageServerPowerOperations.toast.successSaveSettings');
}
