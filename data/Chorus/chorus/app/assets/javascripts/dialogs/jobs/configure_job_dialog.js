chorus.dialogs.ConfigureJob = chorus.dialogs.Base.include(chorus.Mixins.DialogFormHelpers).extend({
    constructorName: 'ConfigureJobDialog',
    templateName: 'configure_job_dialog',
    
    title: function () {
        return this.model.isNew() ? t('job.dialog.title') : t('job.dialog.edit.title');
    },
    toastMessage: function () {
        return this.isCreating ? 'job.dialog.create.toast' : 'job.dialog.edit.toast';
    },
    submitTranslation: function () {
        return this.model.isNew() ? "job.dialog.submit" : "job.dialog.edit.submit";
    },

    subviews: {
        ".start_date": "startDatePicker",
        ".end_date": "endDatePicker"
    },

    events: {
        "change input:radio": 'toggleScheduleOptions',
        "change .end_date_enabled": 'toggleEndRunDateWidget',
        "change input:radio[name='success_notify']": 'toggleSuccessRecipientsLink',
        "change input:radio[name='failure_notify']": 'toggleFailureRecipientsLink',
        "click a.select_success_recipients": 'launchSuccessRecipientSelectionDialog',
        "click a.select_failure_recipients": 'launchFailureRecipientSelectionDialog'
    },

    setup: function () {
        // boolean just to hold state of new or existing
        this.isCreating = this.model.isNew() ? true : false;

        this.setupDatePickers();

        this.disableFormUnlessValid({
            formSelector: "form",
            inputSelector: "input",
            checkInput: _.bind(this.checkInput, this)
        });

        this.listenTo(this.getModel(), "saved", this.modelSaved);
        this.listenTo(this.getModel(), 'saveFailed', this.saveFailed);
        this.toggleSubmitDisabled();
    },

    makeModel: function () {
        if (this.model) {
            this.originalModel = this.model;
            this.model = this.model.clone();
        }
        this.creating = !this.model;
        this.model = this.model || new chorus.models.Job({ workspace: {id: this.options.pageModel.id}, intervalUnit: 'on_demand' });
    },

    modelSaved: function () {
        chorus.toast(this.toastMessage(), {toastOpts: {type: "success"}} );
        this.model.trigger('invalidated');
        this.closeModal();

        if (this.creating) {
            chorus.router.navigate(this.model.showUrl());
        }
    },

    setupDatePickers: function () {
        this.startDatePicker = new chorus.views.DatePicker({date: this.model.nextRunDate(), selector: 'start_date'});
        this.endDatePicker = new chorus.views.DatePicker({date: this.model.endRunDate(), selector: 'end_date'});
    },

    postRender: function () {
        _.defer(_.bind(function () {
            chorus.styleSelect(this.$("select"));
        }, this));

        this.$('.end_date').prop("disabled", "disabled");
        this.endDatePicker.disable();

        this.populateSelectors();
        this.toggleEndRunDateWidget();
        this.toggleSubmitDisabled();
    },

    checkInput: function () {
        var fieldValues = this.fieldValues();
        if (!fieldValues.name || fieldValues.name.length === 0) { return false; }

        if (fieldValues.successNotify === 'selected' && (this.model.get('successRecipients') || []).length === 0) {
            return false;
        }

        if (fieldValues.failureNotify === 'selected' && (this.model.get('failureRecipients') || []).length === 0) {
            return false;
        }

        if (this.isOnDemand()) { return true; }

        return fieldValues.intervalValue.length > 0 &&
            this.startDatePicker.getDate().isValid() &&
            (!this.endDateEnabled() || this.endDatePicker.getDate().isValid());
    },

    create: function () {
        this.$("button.submit").startLoading('actions.saving');
        this.getModel().save(this.fieldValues(), {wait: true, unprocessableEntity: $.noop});
    },

    getModel: function () {
        return this.originalModel || this.model;
    },

    fieldValues: function () {
        if (this.$('input.name').length === 0) {
            return {};
        }

        return {
            name: this.$('input.name').val(),
            intervalUnit: this.getIntervalUnit(),
            intervalValue: this.getIntervalValue(),
            nextRun: this.isOnDemand() ? false : this.buildStartDate().forceZone(0).format(),
            endRun: this.isOnDemand() || !this.endDateEnabled() ? false : this.buildEndDate().toISOString(),
            timeZone: this.$('select.time_zone').val(),
            successNotify: this.$('[name=success_notify]:checked').val(),
            failureNotify: this.$('[name=failure_notify]:checked').val(),
            successRecipients: this.model.get('successRecipients'),
            failureRecipients: this.model.get('failureRecipients')
        };
    },

    isOnDemand: function () {
        return this.$('input:radio[name=jobType]:checked').val() === 'on_demand';
    },

    getIntervalUnit: function () {
        return this.isOnDemand() ? 'on_demand' : this.$('select.interval_unit').val();
    },

    getIntervalValue: function () {
        return this.isOnDemand() ? '0' : this.$('input.interval_value').val();
    },

    buildStartDate: function () {
        var date = this.startDatePicker.getDate();
        var hourBase = parseInt(this.$('select.hour').val(), 10) % 12;
        var hour = this.$('select.meridiem').val() === "am" ? hourBase : hourBase + 12;
        date.hour(hour);
        date.minute(this.$('select.minute').val());
        return date;
    },

    buildEndDate: function () {
        return this.endDatePicker.getDate();
    },

    toggleScheduleOptions: function () {
        this.$('.interval_options').toggleClass('hidden', this.isOnDemand());
        this.toggleSubmitDisabled();
    },

    toggleEndRunDateWidget: function () {
        this.endDateEnabled() ? this.endDatePicker.enable() : this.endDatePicker.disable();
    },

    endDateEnabled: function () {
        return this.$(".end_date_enabled").prop("checked");
    },

    populateSelectors: function () {
        var runDate = this.model.nextRunDate();

        var hoursBase = runDate.hours();
        var meridiem = hoursBase - 11 > 0 ? "pm" : "am";
        var hours = meridiem === "pm" ? hoursBase - 12 : hoursBase;
        hours = hours === 0 ? 12 : hours;
        var minutes = runDate.minutes();
        var zone = this.model.get('timeZone') || RailsTimeZone.to(jstz.determine().name());

        this.$('select.interval_unit').val(this.model.get('intervalUnit'));

        this.$('select.hour').val(hours);
        this.$('select.minute').val(minutes);
        this.$('select.meridiem').val(meridiem);
        this.$('select.time_zone').val(zone);
    },

    toggleSuccessRecipientsLink: function (e) {
        var selectedSelected = $(e.target).val() === 'selected';
        this.$('a.select_success_recipients').toggleClass('hidden', !selectedSelected);
        this.$('span.select_success_recipients').toggleClass('hidden', selectedSelected);
    },

    toggleFailureRecipientsLink: function (e) {
        var selectedSelected = $(e.target).val() === 'selected';
        this.$('a.select_failure_recipients').toggleClass('hidden', !selectedSelected);
        this.$('span.select_failure_recipients').toggleClass('hidden', selectedSelected);
    },

    launchSuccessRecipientSelectionDialog: function (e) {
        e && e.preventDefault();
        this.preserveFieldValues();
        new chorus.dialogs.PickJobRecipients({model: this.model, condition: 'success'}).launchModal();
    },

    launchFailureRecipientSelectionDialog: function (e) {
        e && e.preventDefault();
        this.preserveFieldValues();
        new chorus.dialogs.PickJobRecipients({model: this.model, condition: 'failure'}).launchModal();
    },

    preserveFieldValues: function () {
        this.model.set(this.fieldValues());
        this.endDatePicker.date = this.model.endRunDate();
        this.startDatePicker.date = this.model.nextRunDate();
    },

    additionalContext: function () {
        var notifyOptions = _.map(['success', 'failure'], function (condition) {
            var notifyOption = this.model.get(condition + 'Notify');
            var notifyRecipients = this.model.get(condition + 'Recipients');
            return {
                labelKey: 'job.dialog.edit.notify.label.' + condition,
                condition: condition,
                notifyEverybody: notifyOption === 'everybody',
                notifySelected: notifyOption === 'selected',
                notifyNobody: !notifyOption || notifyOption === 'nobody',
                recipientCount: notifyRecipients ? notifyRecipients.length : 0
            };
        }, this);

        return {
            hours: _.range(1,13).map(function (digit) {
                return {value: digit};
            }),
            minutes: _.range(0,60).map(function (digit) {
                return {
                    value: digit,
                    label: digit > 9 ? digit : "0" + digit.toString()
                };
            }),
            submitTranslation: this.submitTranslation(),
            runsOnDemand: this.model.runsOnDemand(),
            notifyOptions: notifyOptions
        };
    }
});
