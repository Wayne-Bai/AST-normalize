chorus.Mixins.ServerErrors = {
    serverErrorMessages: function() {
        var output = [];
        var fullKey;
        if (!this.serverErrors) { return output; }

        if (this.serverErrors.fields) {
            _.each(this.serverErrors.fields, function(errors, field) {
                _.each(errors, function(context, error) {
                    var fullKey = "field_error." + field + "." + error,
                        genericKey = "field_error." + error,
                        message;

                    if (I18n.lookup(fullKey)) {
                        message = t(fullKey, context);
                    } else {
                        context.field = _.humanize(field);
                        message = t(genericKey, context);
                    }

                    output.push(message);
                });
            });
        } else if (this.serverErrors.record) {
            fullKey = "record_error." + this.serverErrors.record + ".text";

            if (I18n.lookup(fullKey)) {
                output = [t(fullKey, this.serverErrors)];
            }
        } else if (this.serverErrors.service) {
            fullKey = "service_error." + this.serverErrors.service;

            if (I18n.lookup(fullKey)) {
                output = [t(fullKey)];
            }
        }
        if (this.serverErrors.message) {
            output.push(this.serverErrors.message);
        }

        return output;
    },

    serverErrorMessage: function() {
        return this.serverErrorMessages().join("\n");
    }
};
