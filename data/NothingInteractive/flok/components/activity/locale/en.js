/**
 * Flok activity language strings
 * Note that they're prefixed with both the flok and activity namespaces.
 * @copyright  Nothing Interactive 2014
 */
var locale = {
    flok: {}
};

locale.flok.activity = {
    'title': 'Activity',
    'user': {
        'follow': 'Follow'
    },
    'item': {
        'datetimeWithDuration': 'on {{date}}, {{duration}}',
        'timeWithDuration': '@ {{ time | date : \'HH:MM\' }}, {{duration}}',
        'datetime': 'on {{ date }}'
    },
    'duration': {
        'minutes': '{{minutes}} minutes',
        'hours': '{{hours}} hour(s)',
        'hoursAndMinutes': '{{hours}} hours {{minutes}} minutes',
        'added': 'added {{duration}}',
        'removed': 'removed {{duration}}'
    },
    'and': '...and'
};

module.exports = locale;
