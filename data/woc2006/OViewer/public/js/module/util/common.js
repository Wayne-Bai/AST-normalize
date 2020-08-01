define(function(require, exports, module){
    return {
        binaryFind: function(arr, fn){
            var left = 0,
                right = arr.length,
                index = (left + right) >>> 1,
                r = 0;
            if(right < 0){
                return null;
            }
            var item = arr[index];
            while ((r = fn(item)) != 0 && left <= right){
                if(r > 0){
                    left = index + 1;
                }else{
                    right = index - 1;
                }
                index = (left + right) >>> 1;
                item = arr[index];
            }
            if(r != 0){
                return null;
            }
            return item;
        },

        getElementPosition: function(el){
            if(el && el.length){
                var rawPos = el.css('webkitTransform'); //return like "matrix(1, 0, 0, 1, 60, 0)"
                var match = rawPos.match(/\d+/g);
                if(match){
                    return {
                        x: parseInt(match[4]) || 0,
                        y: parseInt(match[5]) || 0
                    };
                }
            }
            return {
                x: 0, y:0
            };
        }
    };
});