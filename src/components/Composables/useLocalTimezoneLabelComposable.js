import { format } from 'date-fns-tz';
import { shortTimeZone } from '../utilities/dateFilter';
const useLocalTimezoneLabelComposable = () => {

    const localOffset = () =>{
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const shortTz = shortTimeZone(new Date());
        const pattern = `'${shortTz}' O`;
        return format(new Date(), pattern, { timezone }).replace('GMT', 'UTC');
      }

    return {
        localOffset
    };
  };

export default useLocalTimezoneLabelComposable;
