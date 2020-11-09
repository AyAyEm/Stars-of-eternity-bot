import * as moment from 'moment-timezone';
import 'twix';

import { timezone } from '@config';

export function audioDate() {
  const startDate = moment.tz(timezone);
  const formatOptions = 'DD-MM-YYTHH_mm';
  return {
    startToEndDate: () => {
      const endingDate = moment.tz(timezone);
      return startDate.twix(endingDate).format({
        dayFormat: '-MM',
        monthFormat: 'DD',
        yearFormat: '-YY',
        hourFormat: 'THH_',
        minuteFormat: 'mm_ss',
      }).replace(/[ ,:]/g, '');
    },
    startDate: startDate.format(formatOptions),
    newDate: () => moment.tz(timezone).format('DD/MM/YYYY HH:mm:ss'),
  };
}
