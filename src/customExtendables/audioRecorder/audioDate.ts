import moment from 'moment-timezone';
import 'twix';

import { config } from '../../config';

export function audioDate() {
  const startDate = moment.tz(config.timezone);
  const formatOptions = 'DD-MM-YYTHH_mm';
  return {
    startToEndDate: () => {
      const endingDate = moment.tz(config.timezone);
      return startDate.twix(endingDate).format({
        dayFormat: '-MM',
        monthFormat: 'DD',
        yearFormat: '-YY',
        hourFormat: 'THH_',
        minuteFormat: 'mm_ss',
      }).replace(/[ ,:]/g, '');
    },
    startDate: startDate.format(formatOptions),
    newDate: () => moment.tz(config.timezone).format('DD/MM/YYYY HH:mm:ss'),
  };
}
