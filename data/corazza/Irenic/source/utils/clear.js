//Clears the list of all objects whose <prop> porperty is equal to <value> value.

Irenic.clear = function(array, prop, value)
{
    ret = [];
    
    for (var i = 0; i < array.length; i ++)
    {
        if (array[i][prop] != value)
        {
            ret.push(array[i]);
        }
    }
    
    return ret;
}
