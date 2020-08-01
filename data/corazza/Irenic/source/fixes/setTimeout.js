Irenic.TC = 0; //Timeout counter.

//Wrap up the setTimeout function so it increments the counter...
setTimeout = (function()
{
    var original = setTimeout;
    
    return function(func, delay)
    {
        func = Irenic.mergeFunctions(func, function()
        {
            -- Irenic.TC;
        });
           
        ++ Irenic.TC;
        return original(func, delay);
    }
})();

//Wrap up the setInterval function so it decrements the counter...
clearTimeout = (function()
{
    var original = clearTimeout;
    
    return function(id)
    {
        -- Irenic.TC;
        return original(id);
    }
})();
