﻿(function()
{
    'use strict';

    var serviceId = 'model.validation';

    angular.module('app').factory(serviceId, ['common', modelValidation]);

    function modelValidation(common)
    {
        var entityNames;

        var log = common.logger.getLogFn(serviceId);

        var Validator = breeze.Validator,
            requireReferenceValidator,
            twitterValidator;

        var service =
            {
                applyValidators: applyValidators,
                createAndRegister: createAndRegister
            };

        return service;

        function applyValidators(metadataStore)
        {
            applyRequireReferenceValidators(metadataStore);
            applyTwitterValidators(metadataStore);
            applyEmailValidators(metadataStore);
            applyUrlValidators(metadataStore);

            log('Validators applied', null, serviceId);
        }

        function createAndRegister(eNames)
        {
            entityNames = eNames;

            // Step 1) Create it
            requireReferenceValidator = createRequireReferenceValidator();
            twitterValidator = createTwitterValidator();

            // Step 2) Tell breeze about it
            Validator.register(requireReferenceValidator);
            Validator.register(twitterValidator);

            // Step 3) Later we will apply them to the properties/entites via applyValidators
            log('Validators created and registered', null, serviceId, false);
        }

        function applyEmailValidators(metadataStore)
        {
            var entityType = metadataStore.getEntityType(entityNames.speaker);

            entityType.getProperty('email').validators.push(Validator.emailAddress());
        }

        function applyRequireReferenceValidators(metadataStore)
        {
            var navigations = ['room', 'track', 'timeSlot', 'speaker'];

            var entityType = metadataStore.getEntityType(entityNames.session);

            navigations.forEach(function(propertyName)
            {
                entityType.getProperty(propertyName).validators
                    .push(requireReferenceValidator);
            });
        }

        function applyTwitterValidators(metadataStore)
        {
            var entityType = metadataStore.getEntityType(entityNames.speaker);

            entityType.getProperty('twitter').validators.push(twitterValidator);
        }

        function applyUrlValidators(metadataStore)
        {
            var entityType = metadataStore.getEntityType(entityNames.speaker);

            entityType.getProperty('blog').validators.push(Validator.url());
        }

        function createTwitterValidator()
        {
            var val = Validator.makeRegExpValidator(
                'twitter',
                /^@([a-zA-Z]+)([a-zA-Z0-9_]+)$/,
                "Invalid Twitter User Name: '%value%'");

            return val;
        }

        function createRequireReferenceValidator()
        {
            var name = 'requireReferenceEntity';

            // isRequired = true so zValidate directive displays required indicator
            var ctx = { messageTemplate: 'Missing %displayName%', isRequired: true };
            var val = new Validator(name, valFunction, ctx);
            return val;

            // passes if reference has a value and is not the nullo (whose id === 0)
            function valFunction(value)
            {
                return value ? value.id !== 0 : false;
            }
        }
    }
})();