'use strict';

/**
 * @ngdoc service
 * @name phrPrototypeApp.account
 * @description
 * # account
 * Service in the phrPrototypeApp.
 */
angular.module('phrPrototypeApp')
    .service('account', function account() {

        this.account = function (callback) {
            var account = {
                "name": {
                    "middle": [
                        "Isa"
                    ],
                    "last": "Jones",
                    "first": "Isabella"
                },
                "dob": [{
                    "date": "1975-05-01T00:00:00Z",
                    "precision": "day"
                }],
                "gender": "Female",
                "identifiers": [{
                    "identifier": "2.16.840.1.113883.19.5.99999.2",
                    "identifier_type": "998991"
                }, {
                    "identifier": "2.16.840.1.113883.4.1",
                    "identifier_type": "111-00-2330"
                }],
                "marital_status": "Married",
                "addresses": [{
                    "streetLines": [
                        "1357 Amber Drive"
                    ],
                    "city": "Beaverton",
                    "state": "OR",
                    "zip": "97867",
                    "country": "US",
                    "use": "primary home"
                }],
                "phone": [{
                    "number": "(816)276-6909",
                    "type": "primary home"
                }],
                "email": [{
                    "email": "test@fake.com",
                    "type": "primary home"
                }, {
                    "email": "test@fakework.com",
                    "type": "primary work"
                }],
                "race_ethnicity": "White",
                "languages": [{
                    "language": "English",
                    "preferred": true,
                    "mode": "Expressed spoken",
                    "proficiency": "Good"
                }],
                "religion": "Christian (non-Catholic, non-specific)",
                "birthplace": {
                    "city": "Beaverton",
                    "state": "OR",
                    "zip": "97867",
                    "country": "US"
                },
                "guardians": [{
                    "relation": "Parent",
                    "addresses": [{
                        "streetLines": [
                            "1357 Amber Drive"
                        ],
                        "city": "Beaverton",
                        "state": "OR",
                        "zip": "97867",
                        "country": "US",
                        "use": "primary home"
                    }],
                    "names": [{
                        "last": "Jones",
                        "first": "Ralph"
                    }],
                    "phone": [{
                        "number": "(816)276-6909",
                        "type": "primary home"
                    }]
                }]
            };

            callback(null, account);
        };

    });
