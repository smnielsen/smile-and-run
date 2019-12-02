require('moment/locale/uk');
const moment = require('moment');
moment.locale('uk');

exports.getTotalDays = (startMoment, endMoment) =>
  endMoment.diff(startMoment, 'days');

exports.getVacationDays = (startMoment, endMoment) =>
  startMoment.businessDiff(endMoment);

const MOMENT_DATE_FORMAT = 'YYYY-MM-DD';
exports.momentDate = dateStr => moment(dateStr, MOMENT_DATE_FORMAT);
exports.momentToDateString = date => moment(date).format(MOMENT_DATE_FORMAT);
exports.getTimeString = () => moment().format('DD.MM.YYYY HH:mm:ss:SSS');
exports.moment = moment;
