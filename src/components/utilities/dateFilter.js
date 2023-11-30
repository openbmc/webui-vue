import { format } from 'date-fns';
import { GlobalStore } from '../../store/modules/GlobalStore';

const globalStore = () => { return GlobalStore() };

// Short time zone filter
export const shortTimeZone = (value) => {
  const longTZ = value
    .toString()
    .match(/\((.*)\)/)
    .pop();
  const regexNotUpper = /[*a-z ]/g;
  return longTZ.replace(regexNotUpper, '');
};

// Date formatting filter
export const formatDate = (value) => {
  const isUtcDisplay = globalStore.isUtcDisplay

  if (value instanceof Date) {
    if (isUtcDisplay) {
      return value.toISOString().substring(0, 10);
    }
    const pattern = `yyyy-MM-dd`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return format(value, pattern, { timeZone: timezone });
  }
};

// Time formatting filter
export const formatTime = (value) => {
  const isUtcDisplay = globalStore.isUtcDisplay;

  if (value instanceof Date) {
    if (isUtcDisplay) {
      let timeOptions = {
        timeZone: 'UTC',
        hourCycle: 'h23',
      };
      return `${value.toLocaleTimeString('default', timeOptions)} UTC`;
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const shortTz = shortTimeZone(value);
    const pattern = `HH:mm:ss ('${shortTz}' O)`;
    return format(value, pattern, { timeZone: timezone }).replace('GMT', 'UTC');
  }
};
