var Class = require('../../../lib/shipyard/class/Class'),
    Syncable = require('../../../lib/shipyard/sync/Syncable'),
    BrowserSync = require('../../../lib/shipyard/sync/Browser'),
    localStorage = require('../../../lib/shipyard/dom/localStorage'),
    string = require('../../../lib/shipyard/utils/string');

module.exports = {

    'BrowserSync': function(it, setup) {
        
        var MockSyncable,
            table;
        setup('beforeEach', function() {
            table = string.uniqueID();
            MockSyncable = new Class({
                Extends: Syncable,
                Sync: {
                    'default': {
                        driver: BrowserSync,
                        table: table
                    }
                },
                toJSON: function() {
                    return this.__data;
                }
            });
        });
        
        it('should update the Syncable after a create', function(expect) {
            var ex = new MockSyncable();
            ex.once('save', function() {
                expect(ex.get('pk')).not.toBeUndefined();
            });
            ex.save();
            
        });

        it('should delete from localStorage on destroy', function(expect) {
            var ex = new MockSyncable();
            // null since never set
            expect(localStorage.getItem(table)).toBeNull();
            ex.save();
            // now it should be a string of json
            expect(localStorage.getItem(table)).not.toBeNull();
            ex.destroy();
            // it should be a string of an empty object 
            expect(localStorage.getItem(table)).toBe('{}');
        });
    }

};
