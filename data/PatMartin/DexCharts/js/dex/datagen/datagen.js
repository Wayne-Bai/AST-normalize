dex.datagen = {};

/**
 *
 * @param spec The specification for this matrix.
 * @returns {Array}
 */
dex.datagen.randomMatrix = function(spec)
{
	var ri, ci;
	
  //{"rows":10, "columns": 4, "min", 0, "max":100})
  var matrix = [];
  var range = spec.max - spec.min;
  for (ri = 0; ri<spec.rows; ri++)
  {
  	var row = [];

  	for (ci=0; ci<spec.columns;ci++)
  	{
      row.push(Math.random() * range + spec.min);
  	}
  	matrix.push(row);
  }
  
  return matrix;
};
