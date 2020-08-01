//The identification manager.

Irenic.IDM = function(args)
{
    var idm = this;
    
    idm.id = "";
    idm.signs = args.signs || "0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ";
}

Irenic.IDM.prototype.isLast = function(sign)
{
    var idm = this;

    if (sign == idm.signs[idm.signs.length - 1])
    {
        return true;
    }
    
    return false;
}

Irenic.IDM.prototype.isFirst = function(sign)
{
    var idm = this;

    if (sign == idm.signs[0])
    {
        return true;
    }
    
    return false;
}

Irenic.IDM.prototype.isAllLast = function(id)
{
    var idm = this;
    
    var ret = true;
    
    for (var i = 0; i < id.length; i ++)
    {
        if (id[i] != idm.signs[idm.signs.length - 1])
        {
            ret = false;
        }
    }
    
    return ret;
}

Irenic.IDM.prototype.increaseIdLength = function(id)
{
    var idm = this;

    newId = "";
    
    for (var i = 0; i <= id.length; i ++)
    {
        newId += idm.signs[0];
    }
    
    return newId;
}

Irenic.IDM.prototype.nextSign = function(sign)
{
    var idm = this;
    
    for (var i = 0; i < idm.signs.length - 1; i ++)
    {
        if (sign == idm.signs[i])
        {
            return idm.signs[i + 1];
        }
    }

    return idm.signs[0];
}

Irenic.IDM.prototype.advanceSignInId = function(id, i)
{
    var idm = this;

    var newId = "";
    var overflow = false;

    for (var j = 0; j < id.length; j ++)
    {
        if (i == j)
        {
            newId += idm.nextSign(id[i]);

            if (idm.isLast(id[i]))
            {
                overflow = true;
            }
        }
        else
        {
            newId += id[j];
        }
    }
    
    if (!overflow)
    {
        return newId;
    }
    else
    {
        return idm.advanceSignInId(newId, i + 1);
    }
}

Irenic.IDM.prototype.advanceId = function(id)
{
    var idm = this;

    if (id.length == 0)
    {
        return idm.signs[0];
    }
    
    if (idm.isAllLast(id))
    {
        return idm.increaseIdLength(id);
    }
    
    return idm.advanceSignInId(id, 0);
}

Irenic.IDM.prototype.getNextId = function()
{
    var idm = this;
    
    idm.id = idm.advanceId(idm.id);
    
    return idm.id;    
}


