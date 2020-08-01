var noise = require("../build/Release/noise.node");

module.exports = PerlinNoise;

function PerlinNoise(seed, iterations)
{
    iterations = iterations || 3;
    var divider = (1 << (iterations)) - 1;
    var multipliers = [];
    var scales = [];

    for (var iter = 0; iter < iterations; iter++) {
        multipliers.push(1 << (iterations - iter - 1));
        scales.push(1 << iter);
    }

    this.get = function get(x, y, z) {
        var value = 0, mult, scale;

        for (var i = 0; i < iterations; i++) {
            mult  = multipliers[i];
            scale = scales[i];

            value += noise.doubleNoise3(seed, x * scale, y * scale, z * scale) * (mult / divider);
        }

        return value;
    };
}
