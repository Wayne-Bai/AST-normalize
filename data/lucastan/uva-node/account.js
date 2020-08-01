const cryptoUtil = require('./cryptoUtil');
const Adapter = require('./adapter');

module.exports = (function(){
    // constructor
    function cls(data)
    {
        // private instance fields
        var type = Adapter.normalizeType(data.type);
        var typeLower = data.type.toLowerCase();
        var user = data.user;
        var passIv = data.passIv;
        
        // if pass is encrypted, it will be decrypted later on
        var pass = data.pass;

        // Object that stores encrypted password, to be stringified
        var obj = {
            type: type,
            user: user,
            pass: pass,
            passIv: passIv,
            adapData: data.adapData || {}
        };

        // encrypted?
        if (passIv)
        {
            var buf = cryptoUtil.decrypt(
                        new Buffer(pass, 'hex'), 
                        new Buffer(passIv, 'hex'));
            pass = buf.toString('utf8');
        }
        else
        {
            var r = cryptoUtil.encrypt(new Buffer(pass, 'utf8'));
            obj.pass = r.buf.toString('hex');
            obj.passIv = passIv = r.iv.toString('hex');
        }

        /**
         * Gets the JSON object to be stringified.
         */
        this.toJSON = function(){
            return obj;
        };

        this.user = function(){return user;};
        this.pass = function(){return pass;};
        this.type = function(){return type;};

        this.match = function(_type, _user){
            return _type.toLowerCase() === typeLower && user === _user;
        };

        this.getAdapterData = function(){
            return obj.adapData;
        };
    }

    return cls;
})();

