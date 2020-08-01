import Entry from "../Entry";

class View {
    constructor(name) {
        this.entity = null;
        this._actions = null;
        this._title = false;
        this._description = '';
        this._template = null;

        this._enabled = true;
        this._fields = [];
        this._type = null;
        this._name = name;
        this._order = 0;
        this._errorMessage = null;
        this._url = null;
    }

    get enabled() {
        return this._enabled;
    }

    title(title) {
        if (!arguments.length) return this._title;
        this._title = title;
        return this;
    }

    description() {
        if (arguments.length) {
            this._description = arguments[0];
            return this;
        }

        return this._description;
    }

    name(name) {
        if (!arguments.length) {
            return this._name || this.entity.name() + '_' + this._type;
        }

        this._name = name;
        return this;
    }

    disable() {
        this._enabled = false;
    }

    enable() {
        this._enabled = true;
    }

    /**
     * @deprecated Use getter "enabled" instead
     */
    isEnabled() {
        return this._enabled;
    }

    /**
     * @deprecated Use getter "entity" instead
     */
    getEntity() {
        return this.entity;
    }

    /**
     * @deprecated Specify entity at view creation or use "entity" setter instead
     */
    setEntity(entity) {
        this.entity = entity;
        if (!this._name) {
            this._name = entity.name() + '_' + this._type;
        }

        return this;
    }


    /*
     * Supports various syntax
     * fields([ Field1, Field2 ])
     * fields(Field1, Field2)
     * fields([Field1, {Field2, Field3}])
     * fields(Field1, {Field2, Field3})
     * fields({Field2, Field3})
     */
    fields() {
        if (!arguments.length) return this._fields;

        [].slice.call(arguments).map(function(argument) {
            View.flatten(argument).map(arg => this.addField(arg));
        }, this);

        return this;
    }

    static flatten(arg) {
        if (arg.constructor.name === 'Object') {
            console.warn('Passing literal of Field to fields method is deprecated use array instead');
            let result = [];
            for (let fieldName in arg) {
                result = result.concat(View.flatten(arg[fieldName]));
            }
            return result;
        }
        if (Array.isArray(arg)) {
            return arg.reduce(function(previous, current) {
                return previous.concat(View.flatten(current))
            }, []);
        }
        // arg is a scalar
        return [arg];
    }

    get type() {
        return this._type;
    }

    order(order) {
        if (!arguments.length) return this._order;
        this._order = order;
        return this;
    }

    getReferences() {
        return this._fields.filter(field => field.type() === 'reference' || field.type() === 'reference_many');
    }

    getReferencedLists() {
        var result = {};
        var lists = this._fields.filter(f => f.type() === 'referenced_list');
        for (let i = 0, c = lists.length ; i < c ; i++) {
            let list = lists[i];
            result[list.name()] = list;
        }

        return result;
    };

    mapEntry(restEntry) {
        return new Entry.mapFromRest(this, restEntry);
    }

    mapEntries(restEntries) {
        return restEntries.map(e => this.mapEntry(e));
    }

    template(template) {
        if (!arguments.length) {
            return this._template;
        }

        this._template = template;

        return this;
    }

    identifier() {
        var identifier;

        var fields = this._fields;
        for (var i in fields) {
            if (fields[i].identifier()) {
                identifier = fields[i];
                break;
            }
        }

        // No identifier fields on this view, try to find it on other view
        if (!identifier) {
            identifier = this.entity.identifier();
        }

        if (!arguments.length) {
            return identifier;
        }

        return this;
    }

    actions(actions) {
        if (!arguments.length) return this._actions;
        this._actions = actions;
        return this;
    }

    processFieldsDefaultValue(entry) {

        this._fields.forEach(function (field) {
            entry.values[field.name()] = field.defaultValue();
        });

        return entry;
    }

    removeFields() {
        this._fields = [];
        return this;
    }

    getFields() {

        return this._fields;
    }

    getField(fieldName) {
        return this._fields.filter(f => f.name() === fieldName)[0];
    }

    getFieldsOfType(type) {
        return this._fields.filter(f => f.type() === type);
    }

    addField(field) {
        if (field.order() === null) {
            field.order(this._fields.length, true);
        }
        this._fields.push(field);
        this._fields = this._fields.sort((a, b) => (a.order() - b.order()));

        return this;
    }

    getErrorMessage(response) {
        if (typeof(this._errorMessage) === 'function') {
            return this._errorMessage(response);
        }

        return this._errorMessage;
    }

    errorMessage(errorMessage) {
        if (!arguments.length) return this._errorMessage;
        this._errorMessage = errorMessage;
        return this;
    }

    url(url) {
        if (!arguments.length) return this._url;
        this._url = url;
        return this;
    }

    getUrl(entityId) {
        if (typeof(this._url) === 'function') {
            return this._url(entityId);
        }

        return this._url;
    };
}

export default View;
