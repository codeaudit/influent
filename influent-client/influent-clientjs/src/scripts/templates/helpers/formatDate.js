/*
 * Copyright (C) 2013-2015 Uncharted Software Inc.
 *
 * Property of Uncharted(TM), formerly Oculus Info Inc.
 * http://uncharted.software/
 *
 * Released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * This helper allows you to format a date object/string using typical date formats.
 * When using the template there are two hash parameters:
 * format:
 *   The string representation of the format. Can either be one of the common
 *   dateFormat.masks defined below, or can be a typical java SimpleDateFormat parse string.
 * isUTC:
 *   A boolean that indicates whether the datetime should be treated as UTC value or not.
 *   Default is false.
 */
define('templates/helpers/formatDate', ['hbs/handlebars'], function(Handlebars) {

	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 *
	 * Retrieved from http://stackoverflow.com/questions/3552461/how-to-format-javascript-date
	 */

	var dateFormat = (function () {
		var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) { val = '0' + val; }
				return val;
			};

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = dateFormat;

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}

			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date();
			if (isNaN(date)) {
				throw new SyntaxError('invalid date');
			}

			mask = String(dF.masks[mask] || mask || dF.masks['default']);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) === 'UTC:') {
				mask = mask.slice(4);
				utc = true;
			}

			var _ = utc ? 'getUTC' : 'get',
				d = date[_ + 'Date'](),
				D = date[_ + 'Day'](),
				m = date[_ + 'Month'](),
				y = date[_ + 'FullYear'](),
				H = date[_ + 'Hours'](),
				M = date[_ + 'Minutes'](),
				s = date[_ + 'Seconds'](),
				L = date[_ + 'Milliseconds'](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  dF.i18n.dayNames[D],
					dddd: dF.i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  dF.i18n.monthNames[m],
					mmmm: dF.i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? 'a'  : 'p',
					tt:   H < 12 ? 'am' : 'pm',
					T:    H < 12 ? 'A'  : 'P',
					TT:   H < 12 ? 'AM' : 'PM',
					Z:    utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
					o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
				};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	})();

	// Some common format strings
	dateFormat.masks = {
		'default':      'ddd mmm dd yyyy HH:MM:ss',
		shortDate:      'm/d/yy',
		mediumDate:     'mmm d, yyyy',
		longDate:       'mmmm d, yyyy',
		fullDate:       'dddd, mmmm d, yyyy',
		shortTime:      'h:MM TT',
		mediumTime:     'h:MM:ss TT',
		longTime:       'h:MM:ss TT Z',
		isoDate:        'yyyy-mm-dd',
		isoTime:        'HH:MM:ss',
		isoDateTime:    'yyyy-mm-dd\'T\'HH:MM:ss',
		isoUtcDateTime: 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\''
	};

	// Internationalization strings
	dateFormat.i18n = {
		dayNames: [
			'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
			'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
		],
		monthNames: [
			'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
			'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
		]
	};

	/**
	 * Options here can have two hash values:
	 * 'format', or 'isUTC'
	 * format:
	 *   The string representation of the format. Can either be one of the common
	 *   dateFormat.masks defined below, or can be a typical java SimpleDateFormat parse string.
	 * isUTC:
	 *   A boolean that indicates whether the datetime should be treated as UTC value or not.
	 *   Default is false.
	 * @param datetime
	 *   The actual date value. Can either be a Date object or a string/number.
	 * @param options
	 * @returns {SafeString}
	 */
	function formatDate(datetime, options) {
		if (!(datetime instanceof Date)) {
			datetime = new Date(datetime);
		}

		var format = options.hash['format'];
		var isUTC = options.hash['isUTC'];

		//apply the format
		return new Handlebars.SafeString(dateFormat(datetime, format, isUTC));
	}

	Handlebars.registerHelper('formatDate', formatDate);
	return formatDate;
});

