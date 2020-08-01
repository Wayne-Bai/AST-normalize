define(
    ['jquery', 'underscore', 'backbone', 'app', 'crel', 'text!templates/modals/admin/groups.html'],
    function ($, _, Backbone, app, crel, myTemplate) {
        'use strict';
        var exports = {
            Collection: Backbone.Collection.extend({
                baseUrl: 'api/v1/groups',
                params: {},
                url: function () {
                    return this.baseUrl + '?' + $.param(this.params);
                }
            }),
            PermissionCollection: Backbone.Collection.extend({
                url: 'api/v1/permissions'
            }),
            View: Backbone.View.extend({
                initialize: function () {
                    this.template = myTemplate;
                    this.customerContext = app.user.toJSON().current_customer;
                    this.collection = new exports.Collection();
                    this.collection.params = {};
                    this.permissions = new exports.PermissionCollection();
                    this.listenTo(this.permissions, 'sync', this.render);
                    this.listenTo(this.collection, 'sync', this.render);
                    this.listenTo(app.user, 'sync', this.render);
                    this.collection.fetch();
                    this.permissions.fetch();
                    app.user.fetch();
                    return this;
                },
                events: {
                    'click button[name=addGroup]':          'toggleCreateGroup',
                    'click button[name=cancelNewGroup]':    'toggleCreateGroup',
                    'click button[name=submitGroup]':       'submitGroup',
                    'click a.accordion-toggle':             'toggleAccordion',
                    'click button[name=toggleDelete]':      'toggleDelete',
                    'click button[name=deleteGroup]':       'deleteGroup',
                    'change input[name=userSelect]':        'toggleUser',
                    'click input[data-id=toggle]':          'togglePermission',
                    'change #customerContext':              'changeCustomerContext'
                },
                changeCustomerContext: function (event) {
                    this.collection.params.customer_context = this.customerContext = event.val;
                    this.collection.fetch();
                    return this;
                },
                toggleDelete: function (event) {
                    var $button = $(event.currentTarget),
                        $span = $button.siblings('span');
                    if ($span.length === 0) {
                        $span = $button.parent();
                        $button = $span.siblings('button');
                    }
                    $span.toggle();
                    $button.toggle();
                    return this;
                },
                deleteGroup: function (event) {
                    var $button = $(event.currentTarget),
                        $alert = this.$el.find('div.alert'),
                        $groupRow = $button.parents('.item'),
                        groupId = $button.attr('value'),
                        url = 'api/v1/groups',
                        that = this;
                    $.ajax({
                        type: 'DELETE',
                        url: '/api/v1/group/' + groupId,
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(response){
                            if (response.rv_status_code) {
//                                that.collection.fetch();
                                $groupRow.remove();
                                $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                            }
                            else {
                                $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                            }
                        }
                    });
                    return this;
                },
                toggleCreateGroup: function () {
                    var $newGroupDiv = this.$el.find('#newGroupDiv');
                    $newGroupDiv.toggle();
                    return this;
                },
                submitGroup: function (event) {
                    var params, that = this,
                        $submitButton = $(event.currentTarget),
                        $alert = $submitButton.siblings('.alert'),
                        groupName = $submitButton.siblings('input').val(),
                        url = 'api/v1/groups',
                        groupPermissions = [];

                    var checkboxes = this.$el.find('div[name=aclOptions]').find('input[type=checkbox]');
                    _.each(checkboxes, function(checkbox) {
                        if($(checkbox).prop('checked'))
                        {
                           groupPermissions.push($(checkbox).val());
                        }
                    });
                    params = {
                        group_name: groupName,
                        permissions: groupPermissions,
                        customer_context: this.customerContext
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
                                that.collection.fetch();
                            } else {
                                $alert.removeClass('alert-success').addClass('alert-error').show().html(response.message);
                            }
                        }
                    });
                    return this;
                },
                toggleAccordion: function (event) {
                    var $href = $(event.currentTarget),
                        $icon = $href.find('i'),
                        $parent = $href.parents('.accordion-group'),
                        $body = $parent.find('.accordion-body').first();
                    event.preventDefault();
                    $icon.toggleClass('icon-circle-arrow-down icon-circle-arrow-up');
                    $body.unbind().collapse('toggle');
                    $body.on('hidden', function (event) {
                        event.stopPropagation();
                    });
                    return this;
                },
                toggleUser: function (event) {
                    var $input = $(event.currentTarget),
                        groupID = $input.data('id'),
                        username = event.added ? event.added.text : event.removed.text,
                        url = 'api/v1/group/' + groupID,
                        $alert = this.$el.find('div.alert'),
                        users = [],
                        params;
                    users.push(username);
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
                            if (response.rv_status_code === 13007) {
                                $alert.hide();
                            } else {
                                $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                            }
                        }
                    });
                    return this;
                },
                togglePermission: function (event) {
                    var $input = $(event.currentTarget),
                        $item = $input.parents('.accordion-group'),
                        $alert = this.$el.find('div.alert'),
                        url = 'api/v1/groups',
                        group = $item.data('id'),
                        params = {
                            id: group,
                            permission: $input.val(),
                            customer_context: this.customerContext
                        };
                    $.post(url, params, function (response) {
                        if (response.rv_status_code) {
                            $alert.hide();
                        } else {
                            $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                        }
                    });
                    return this;
                },
                beforeRender: $.noop,
                initSelect: function () {
                    this.$el.find('label').show();
                    var $customers = this.$('select[name="customers"]');
                    $customers.select2({width: '100%'});
                    return this;
                },
                renderPermissions: function () {
                    var permissions = this.permissions.toJSON()[0],
                        $items = this.$el.find('.accordion-group');
                    if (permissions) {
                        $items.each(function (i, item) {
                            var $inner = $(item).find('.accordion-inner'),
                                groupName = $(item).data('name'),
                                $permissionsDiv = $
                                (
                                    crel('div', {class: 'permissions-info'},
                                        crel('div', {class: 'permissions-heading'},
                                            crel('p', 'Permissions:')
                                        )
                                    )
                                ),
                                $div = $(crel('div', {class: 'span12'}));
                            if (groupName === 'Administrator') {
                                _.each(permissions.data, function (permission) {
                                    $div.append(
                                        crel('div', {class: 'span3 noMargin'},
                                            crel('label', {class: 'checkbox'},
                                                crel('small', permission),
                                                crel('input', {type: 'checkbox', disabled: 'disabled', checked: 'checked', name: permission.replace(' ', '_'), value: permission, 'data-id': 'toggle'})
                                            )
                                        )
                                    );
                                });
                            }
                            else
                            {
                                _.each(permissions.data, function (permission) {
                                    $div.append(
                                        crel('div', {class: 'span3 noMargin'},
                                            crel('label', {class: 'checkbox'},
                                                crel('small', permission),
                                                crel('input', {type: 'checkbox', disabled: 'disabled', name: permission.replace(' ', '_'), value: permission, 'data-id': 'toggle'})
                                            )
                                        )
                                    );
                                });
                            }
                            $inner.append($permissionsDiv.append($div));
                        });
                        this.checkPermissions();
                    }
                    return this;
                },
                checkPermissions: function () {
                    var groups = this.collection.toJSON()[0],
                        that = this;
                    if (groups) {
                        _.each(groups.data, function (group) {
                            if (group.group_name !== 'Administrator') {
                                var permissions = group.permissions,
                                    $groupDiv = that.$el.find('div[data-id=' + group.id + ']');
                                _.each(permissions, function (permission) {
                                    var $input = $groupDiv.find('input[name=' + permission.replace(' ', '_') + ']');
                                    $input.prop('checked', true);
                                });
                            }
                        });
                    }
                    return this;
                },
                renderItems: function () {
                    var $items = this.$el.find('.items'),
                        fragment = document.createDocumentFragment(),
                        data = this.collection.toJSON()[0],
                        deleteButton;
                    if (data && data.rv_status_code === 1001) {
                        _.each(data.data, function (group) {
                            if (group.group_name === 'Administrator') {
                                deleteButton = '';
                            } else {
                                deleteButton = crel('button', {title: 'Delete Group', class: 'btn btn-link noMargin', name: 'toggleDelete'},
                                    crel('i', {class: 'icon-remove', style: 'color: red'})
                                );
                            }
                            fragment.appendChild(
                                crel('div', {class: 'accordion-group item clearfix', 'data-id': group.id, 'data-name': group.group_name},
                                    crel('div', {class: 'accordion-heading row-fluid'},
                                        crel('span', {class: 'span4'},
                                            crel('a', {class: 'accordion-toggle'},
                                                crel('i', {class: 'icon-circle-arrow-down'}), ' ' + group.group_name
                                            )
                                        ),
                                        crel('span', {class: 'pull-right'},
                                            deleteButton,
                                            crel('span', {class: 'hide'},
                                                crel('button', {class: 'btn btn-mini btn-danger', name: 'deleteGroup', value: group.id, 'data-groupname': group.group_name}, 'Delete'),
                                                crel('button', {class: 'btn btn-mini', name: 'toggleDelete'}, 'Cancel')
                                            )
                                        )
                                    ),
                                    crel('div', {class: 'accordion-body collapse'},
                                        crel('div', {class: 'accordion-inner'},
                                            crel('label',
                                                crel('small', 'Users for group ' + group.group_name + ':')
                                            ),
                                            crel('input', {type: 'hidden', name: 'userSelect', 'data-id': group.id, 'data-user': group.users.user_name, 'data-url': 'api/v1/group/' + group.id, value: JSON.stringify(group.users)})
                                        )
                                    )
                                )
                            );
                        });
                        $items.append(fragment);
                        this.initSelect();
                    }
                    return this;
                },
                onRender: function () {
                    var $userSelect = this.$el.find('input[name=userSelect]'),
                        that = this;
                    _.each($userSelect, function(select) {
                        $(select).select2({
                            width: '100%',
                            multiple: true,
                            initSelection: function (element, callback) {
                                var data = JSON.parse(element.val()),
                                    results = [];
                                _.each(data, function (object) {
                                    results.push({id: object.user_name, text: object.user_name});
                                });
                                callback(results);
                            },
                            ajax: {
                                url: function () {
                                    return $(select).data('url');
                                },
                               /* data: function () {
                                    return {

                                    };
                                },*/
                                results: function (data) {
                                    var results = [];
                                    if (data.rv_status_code === 1001) {
                                        _.each(data.data.users, function (object) {
                                            results.push({id: object.user_name, text: object.user_name});
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

                    var template = _.template(this.template),
                        data = this.collection.toJSON()[0],
                        customers = app.user.toJSON().customers,
                        payload;

                    if (data && data.rv_status_code === 1001) {
                        payload = {
                            data: data.data,
                            customers: customers,
                            currentCustomer: this.customerContext,
                            viewHelpers: {
                                getOptions: function (options, selected) {
                                    var select = crel('select'), attributes;
                                    selected = selected || false;
                                    if (options.length) {
                                        _.each(options, function (option) {
                                            if (option.administrator) {
                                                attributes = {value: option.id || option.customer_name};
                                                if (selected && option.customer_name === selected) {attributes.selected = selected;}
                                                select.appendChild(crel('option', attributes, option.customer_name));
                                            }
                                        });
                                    }
                                    return select.innerHTML;
                                }
                            }
                        };
                        this.$el.empty();
                        this.$el.html(template(payload));
                        this.renderItems();
                        this.renderPermissions();
                    }

                    if (this.onRender !== $.noop) { this.onRender(); }
                    return this;
                }
            })
        };
        return exports;
    }
);
