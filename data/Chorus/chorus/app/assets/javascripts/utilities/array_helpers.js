(function () {
    chorus.arrayHelpers = chorus.arrayHelpers || {};

    chorus.arrayHelpers.swap = function (arr, a, b) {
        var tmp = arr[a];
        arr[a] = arr[b];
        arr[b] = tmp;
        return arr;
    };
})();
