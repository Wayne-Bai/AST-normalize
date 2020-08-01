(function($) {
    /**
     * boxSpiral, boxSpiralReverse effects
     *
     * @since 1.0.2
     */
    Coo.Effect.register(['boxSpiral', 'boxSpiralReverse'], 'Coo.Effect.BoxSpiral');

    Coo.Effect.BoxSpiral = Coo.Effect._Grid.extend({
        _animate: function() {
            // Store the indices
            var indices = [],
                index   = 0;
            for (var r = 0; r < this._numRows; r++) {
                var a = [];
                for (var c = 0; c < this._numColumns; c++) {
                    a.push(index);
                    index++;
                }
                indices.push(a);
            }
            indices = this._spiralify(indices);
            if ('boxSpiralReverse' == this._effect) {
                // Reverse the indices
                indices = indices.reverse();
            }

            this._showCurrentItem();
            var that      = this,
                t         = 0,
                speed     = this._slider.getOption('animationSpeed'),
                $boxes    = this._slider.$viewPort.find('.' + this._slider.getOption('classPrefix') + 'box');
            $boxes.each(function(i) {
                t += speed / that._numBoxes;
                $boxes
                    .eq(indices[i])
                    .delay(t)
                    .animate({
                        opacity: 1
                    }, speed * 0.3, function() {
                        that._checkComplete();
                    });
            });
        },

        /**
         * Gets an array in spiral order from given two-dimensions array
         *
         * @see http://codereview.stackexchange.com/questions/8207/rearrange-elements-in-two-dimensional-array-spiral-order
         * @param {Array} matrix The given array
         * @return {Array}
         */
        _spiralify: function(matrix) {
            if (matrix.length == 1) {
                return matrix[0];
            }

            var firstRow   = matrix[0],
                numRows    = matrix.length,
                nextMatrix = [],
                newRow,
                row,
                column     = matrix[1].length - 1;

            // Take each column starting with the last and working backwards
            for (column; column >= 0; column--) {
                // An array to store the rotated row we'll make from this column
                newRow = [];

                // Take each row starting with 1 (the second)
                for (row = 1; row < numRows; row++) {
                    // ...and add the item at colIdx to newRow
                    newRow.push(matrix[row][column]);
                }
                nextMatrix.push(newRow);
            }

            // Pass nextMatrix to spiralify and join the result to firstRow
            firstRow.push.apply(firstRow, this._spiralify(nextMatrix));

            return firstRow;
        },

        getClass: function() {
            return 'Coo.Effect.BoxSpiral';
        }
    });
})(window.jQuery);
