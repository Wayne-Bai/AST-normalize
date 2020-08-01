define(
    ['jquery', 'underscore', 'backbone', 'app', 'crel', 'modals/admin/deleteCustomer', 'text!templates/modals/admin/customers.html'],
    function ($, _, Backbone, app, crel, DeleteCustomerModal, CustomersTemplate) {
        'use strict';var exports = {
            Collection: Backbone.Collection.extend({
                baseUrl: 'api/v1/customers',
                params: {},
                url: function () {
                    return this.baseUrl + '?' + $.param(this.params);
                }
            }),
            UserCollection: Backbone.Collection.extend({
                baseUrl: 'api/v1/users',
                url: function () {
                    return this.baseUrl;
                }
            }),
            GroupCollection: Backbone.Collection.extend({
                baseUrl: 'api/v1/groups',
                filter: '',
                url: function () {
                    return this.baseUrl + this.filter;
                }
            }),
            View: Backbone.View.extend({
                initialize: function () {
                    var that = this;
                    this.template = _.template(CustomersTemplate);
                    this.customerContext = app.user.toJSON().current_customer;
                    this.collection = new exports.Collection();
                    this.listenTo(this.collection, 'sync', this.render);
                    this.collection.fetch();
                    this.userCollection = new exports.UserCollection();
                    this.listenTo(this.userCollection, 'sync', this.render);
                    this.userCollection.fetch();
                    this.groupCollection = new exports.GroupCollection();
                    this.groupCollection.filter = '?all_customers=True';
                    this.listenTo(this.groupCollection, 'sync', this.render);
                    this.groupCollection.fetch();
                    return this;
                },
                events: {
                    'click button[name=toggleAcl]'          :   'toggleAclAccordion',
                    'click button[name=toggleDelete]'       :   'confirmDelete',
                    'click button[name=deleteCustomer]'     :   'deleteCustomer',
                    'click button[data-id=toggleCustomer]'  :   'createCustomer',
                    'click #cancelNewCustomer'              :   'createCustomer',
                    'change input[name=groupSelect]'        :   'toggle',
                    'change input[name=userSelect]'         :   'toggle',
                    'click button[name=cancelEditCustomer]' :   'toggleAclAccordion',
                    'click #submitCustomer'                 :   'verifyForm',
                    'click button[name=submitEditCustomer]' :   'verifyForm',
//                    'change #userContext'                   :   'changeUserContext',
                    'click button[data-id=options]'         :   'openOptions',
                    'submit form[name=editCustomer]'        :   'submit'
                },
                openOptions: function (event) {
                    event.preventDefault();
                    var $item = $(event.currentTarget).parents('.item.row-fluid'),
                        $content = $item.find('div[data-type=content], div[data-type=editor]');
                    $content.toggle();
                    return this;
                },
                submit: function (event) {
                    event.preventDefault();
                    var $form = $(event.currentTarget),
                        formId = $form.data('id'),
                        reset = $form.data('reset'),
                        $alert = $form.find('span[data-name=result]'),
                        $inputs = $form.find('[data-id=input]'),
                        customerName = $form.parents('.accordion-group').find('button[name=toggleAcl]').find('span').text(),
                        url = 'api/v1/customer/' + customerName,
                        params = {},
                        valid = true;
                    $inputs.each(function (index, input) {
                        var $control = $(this).parents('.control-group'),
                            $message = $control.find('span[data-name=message]');
                        if (input.value) {
                            params[input.name] = input.value;
                            $control.removeClass('error');
                            $message.html('');
                        } else {
                            $control.addClass('error');
                            $message.html(' Field can\'t be empty.');
                            valid = false;
                        }
                    });
                    if (valid) {
                        $alert.removeClass('alert-error alert-success').addClass('alert-info').html('Submitting...');
                        var that = this;
                        $.ajax({
                            type: 'PUT',
                            url: url,
                            data: JSON.stringify(params),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function(response) {
                                if (response.rv_status_code === 14001)
                                {
                                    if (reset)
                                    {
                                        that.collection.fetch();
                                    }
                                    else
                                    {
                                        $alert.removeClass('alert-error alert-info').addClass('alert-success').html(response.message);
                                        $form[0].reset();
                                    }
                                }
                                else
                                {
                                    $alert.removeClass('alert-info alert-success').addClass('alert-error').html(response.message);
                                }
                            }
                        });
                    }
                },
               /* changeUserContext: function (event) {
                    this.collection.params.user_name = this.userContext = event.val;
                    this.collection.fetch();
                    return this;
                },*/
                toggleAclAccordion: function (event) {
                    event.preventDefault();
                    var $icon,
                        $href = $(event.currentTarget),
                        $accordionParent = $href.parents('.accordion-group'),
                        $accordionBody = $accordionParent.find('.accordion-body').first();
//                        editCustomerForm = this.$('#newCustomerDiv');
                    if($href.attr('name') === 'toggleAcl')
                    {
                        $icon = $href.find('i');
                        $icon.toggleClass('icon-circle-arrow-down icon-circle-arrow-up');
                    }
                    else if($href.attr('name') === 'cancelEditCustomer')
                    {
                        $icon = $href.parents('.accordion-group').find('.accordion-heading').find('i');
                        $icon.toggleClass('icon-circle-arrow-down icon-circle-arrow-up');
                    }
                    $accordionBody.unbind().collapse('toggle');
                    $accordionBody.on('hidden', function (event) {
                        event.stopPropagation();
                    });
                    return this;
                },
                confirmDelete: function (event) {
                    var $parentDiv = $(event.currentTarget).parent();
                    $parentDiv.children().toggle();
                    return this;
                },
                deleteCustomer: function (event) {
                    var that = this,
                        DeletePanel = DeleteCustomerModal.View.extend({
//                            confirm: that.deleteCustomer
                        });
                    if (this.deleteCustomerModal) {
                        this.deleteCustomerModal.close();
                        this.deleteCustomerModal = undefined;
                    }

                    this.deleteCustomerModal = new DeletePanel({
                        name: $(event.currentTarget).val(),
                        type: 'customer',
                        url: 'api/v1/customer',
                        redirect: '#admin/customers',
                        data: this.collection.toJSON()[0].data,
                        customers: app.user.toJSON().customers
                    }).open();
                    return this;
                },
                createCustomer: function (event) {
                    event.preventDefault();
                    var $newCustomerDiv = this.$('#newCustomerDiv');
                    $newCustomerDiv.toggle();
                    return this;
                },
                verifyForm: function (event) {
                    var form = document.getElementById('newCustomerDiv');
                    if (form.checkValidity()) {
                        this.submitCustomer(event);
                    }
                    return this;
                },
                toggle: function (event) {
                    var $input = $(event.currentTarget),
                        customername = $input.data('customer'),
                        username = event.added ? event.added.text : event.removed.text,
                        groupId = $input.data('id'),
                        url = 'api/v1/customer/' + customername,
                        $alert = this.$el.find('div.alert'),
                        params,
                        users = [],
                        groups = [];
                    users.push(username);
                    groups.push(groupId);
                    params = {
                        usernames: users,
                        action: event.added ? 'add' : 'delete'
                    };
                    $.ajax({
                        type: 'POST',
                        url: url,
                        data: JSON.stringify(params),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(response) {
                            if (response.rv_status_code) {
                                $alert.hide();
                            } else {
                                $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                            }
                        }
                    }).error(function (e) { window.console.log(e.responseText); });
                    return this;
                },
                submitCustomer: function (event) {
                    event.preventDefault();
                    var customerName = this.$el.find('#customerName').val(),
                        downloadURL = this.$el.find('#downloadURL').val(),
                        netThrottle = this.$el.find('#netThrottle').val(),
                        cpuThrottle = this.$el.find('#cpuThrottle').val(),
                        serverQueueTTL = this.$el.find('#serverQueueTTL').val(),
                        agentQueueTTL = this.$el.find('#agentQueueTTL').val(),
                        $alert = this.$('#newCustomerDiv').find('.help-online'),
                        url = 'api/v1/customers',
                        that = this,
                        params = {
                            customer_name: customerName,
                            download_url: downloadURL,
                            net_throttle: netThrottle,
                            cpu_throttle: cpuThrottle,
                            server_queue_ttl: serverQueueTTL,
                            agent_queue_ttl: agentQueueTTL
                        };
                    /*this.$el.find('#newCustomerDiv input').focus(function() {
                        $(this).parents('.control-group').removeClass('error');
                        $(this).siblings('.help-block').empty().hide();
                    });*/

                    var alphaNumRegExp = /^[A-Za-z0-9]+$/,
                        numRegExp = /^[0-9]+$/,
                        urlRegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

                    if(!$.trim(customerName))
                    {
                        that.$el.find('#customerName').parents('.control-group').addClass('error');
                        that.$el.find('#customerName').siblings('.help-block').html('Customer Name should not be empty.').show();
                        return false;
                    }
                    else if(!alphaNumRegExp.test(customerName))
                    {
                        that.$el.find('#customerName').parents('.control-group').addClass('error');
                        that.$el.find('#customerName').siblings('.help-block').html('Customer Name should have alphanumeric characters only.').show();
                        return false;
                    }
                    else
                    {
                        that.$el.find('#customerName').parents('.control-group').removeClass('error');
                        that.$el.find('#customerName').siblings('.help-block').empty().hide();
                    }

                    if(!_.isEmpty(downloadURL))
                    {
                        if(!urlRegExp.test(downloadURL))
                        {
                            that.$el.find('#downloadURL').parents('.control-group').addClass('error');
                            that.$el.find('#downloadURL').siblings('.help-block').html('Invalid URL format.').show();
                            return false;
                        }
                        else
                        {
                            that.$el.find('#downloadURL').parents('.control-group').removeClass('error');
                            that.$el.find('#downloadURL').siblings('.help-block').empty().hide();
                        }
                    }

                    if(!numRegExp.test(netThrottle))
                    {
                        that.$el.find('#netThrottle').parents('.control-group').addClass('error');
                        that.$el.find('#netThrottle').siblings('.help-block').html('Net Throttle should have numbers only.').show();
                        return false;
                    }
                    else
                    {
                        that.$el.find('#netThrottle').parents('.control-group').removeClass('error');
                        that.$el.find('#netThrottle').siblings('.help-block').empty().hide();
                    }

                    if(!numRegExp.test(serverQueueTTL))
                    {
                        that.$el.find('#serverQueueTTL').parents('.control-group').addClass('error');
                        that.$el.find('#serverQueueTTL').siblings('.help-block').html('Server Queue TTL should have numbers only.').show();
                        return false;
                    }
                    else
                    {
                        that.$el.find('#serverQueueTTL').parents('.control-group').removeClass('error');
                        that.$el.find('#serverQueueTTL').siblings('.help-block').empty().hide();
                    }

                    if(!numRegExp.test(agentQueueTTL))
                    {
                        that.$el.find('#agentQueueTTL').parents('.control-group').addClass('error');
                        that.$el.find('#agentQueueTTL').siblings('.help-block').html('Agent Queue TTL should have numbers only.').show();
                        return false;
                    }
                    else
                    {
                        that.$el.find('#agentQueueTTL').parents('.control-group').removeClass('error');
                        that.$el.find('#agentQueueTTL').siblings('.help-block').empty().hide();
                    }

                    $.ajax({
                        type: 'POST',
                        url: 'api/v1/customers',
                        data: JSON.stringify(params),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(response) {
                            if (response.rv_status_code) {
                                that.collection.fetch();
                            } else {
                                $alert.removeClass('alert-success').addClass('alert-error').html(response.message).show();
                            }
                        }
                    });
                    return this;
                },
                beforeRender: $.noop,
                onRender: function () {
//                    var $users = this.$('select[name=users]'),
//                        $customers = this.$('select[name=customers]'),
                      var $select = this.$el.find('input[name=groupSelect], input[name=userSelect]'),
                          groups = this.groupCollection.toJSON()[0].data,
                        that = this;
//                    $users.select2({width: '100%'});
//                    $customers.select2({width: '100%'});
                    _.each($select, function(select) {
                        $(select).select2({
                            width: '100%',
                            multiple: true,
                            initSelection: function (element, callback) {
                                var data = JSON.parse(element.val()),
                                    results = [];

                                _.each(data, function (object) {
                                    if(object.id)
                                    {
                                        _.each(groups, function (group) {
                                            if(object.id === group.id)
                                            {
                                                if(_.indexOf(group.permissions, 'administrator') !== -1)
                                                {
                                                    results.push({locked: true, id: object.id, text: object.group_name});
                                                }
                                                else
                                                {
                                                    results.push({id: object.id, text: object.group_name});
                                                }
                                            }
                                        });
                                    }
                                    else
                                    {
                                        results.push({id: object.user_name, text: object.user_name});
                                    }
                                });
                                callback(results);
                            },
                            ajax: {
                                url: function () {
                                    return $(select).data('url');
                                },
                                data: function () {
                                    return {
                                        customer_context: $(select).data('customer')
                                    };
                                },
                                results: function (data) {
                                    var results = [];
                                    if (data.rv_status_code === 1001) {
                                        _.each(data.data, function (object) {
                                            results.push({id: object.id || object.user_name, text: object.group_name ? object.group_name : object.user_name});
                                        });
                                        return {results: results, more: false, context: results};
                                    }
                                }
                            }
                        });
                    });
                    return this;
                },
                render: function () {
                    if (this.beforeRender !== $.noop) { this.beforeRender(); }

                    var template = this.template,
                        data = this.collection.toJSON()[0],
                        users = this.userCollection.toJSON()[0],
                        customers = app.user.toJSON(),
                        payload;

                    if (data && data.rv_status_code === 1001 && users && users.rv_status_code === 1001) {
                        payload = {
                            data: data.data,
                            users: users.data,
                            customers: customers.customers,
                            userContext: this.userContext,
                            viewHelpers: {
                                getOptions: function (options, selected) {
                                    var select = crel('select'), attributes;
                                    selected = selected || false;
                                    if (options.length) {
                                        _.each(options, function (option) {
                                            if (_.isUndefined(option.administrator) || option.administrator) {
//                                                if(option.user_name)
//                                                {
                                                attributes = {value: option.user_name};
                                                if (selected && option.user_name === selected) {attributes.selected = selected;}
                                                select.appendChild(crel('option', attributes, option.user_name));
//                                                }
                                            }
                                        });
                                    }
                                    return select.innerHTML;
                                },
                                controlButtons: function (options) {
                                    var template = crel('div', crel('hr'));
                                    $(template).append(
                                        crel('div', {class: 'control-group'},
                                            crel('div', {class: 'controls'},
                                                crel('button', {type: 'submit', class: 'btn btn-mini btn-primary'}, 'Save'), ' ',
                                                crel('button', {class: 'btn btn-mini btn-danger', 'data-id': 'options'}, 'Cancel'), ' ',
                                                crel('span', {class: 'alert', 'data-name': 'result'})
                                            )
                                        )
                                    );
                                    return template.innerHTML;
                                },
                                renderDeleteButton: function (customer) {
                                    var fragment;
//                                    if (customer.customer_name !== 'default') {
                                    fragment = crel('div');
                                    fragment.appendChild(
                                        crel('button', {title: 'Delete Customer', class: 'btn btn-link noPadding', name: 'toggleDelete'},
                                            crel('i', {class: 'icon-remove', style: 'color: red'}))
                                    );
                                    return fragment.innerHTML;
//                                    }
                                },
                                renderCustomerLink: function (customer) {
                                    var fragment = crel('div');
                                    fragment.appendChild(
                                        crel('button', {name: 'toggleAcl', class: 'btn btn-link noPadding'},
                                            crel('i', {class: 'icon-circle-arrow-down'}, ' '),
                                            crel('span', customer.customer_name)
                                        )
                                    );
                                    /* if (customer.customer_name !== 'default') {
                                     fragment.appendChild(
                                     crel('button', {name: 'toggleAcl', class: 'btn btn-link noPadding'},
                                     crel('i', {class: 'icon-circle-arrow-down'}, ' '),
                                     crel('span', customer.customer_name)
                                     )
                                     );
                                     } else {
                                     fragment.appendChild(
                                     crel('strong', customer.customer_name)
                                     );
                                     }*/
                                    return fragment.innerHTML;
                                }
                            }
                        };
                        this.$el.empty();
                        this.$el.html(template(payload));
                        if (this.onRender !== $.noop) { this.onRender(); }
                    }
                    return this;
                }
            })
        };
        return exports;
    }
);

