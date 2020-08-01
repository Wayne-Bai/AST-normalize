/**
 * @class Represents a 3D Matrix <strong>[A3.M3]</strong>. Used much less than
 * the 4D matrix, but still has a special place in everyone's heart. Like the
 * awkward younger brother at the party.
 *
 * @author Paul Lewis
 */
A3.Core.Math.Matrix3 = function() {

  this.m11 = 0; this.m12 = 0; this.m13 = 0;
  this.m21 = 0; this.m22 = 0; this.m23 = 0;
  this.m31 = 0; this.m32 = 0; this.m33 = 0;

};

A3.Core.Math.Matrix3.prototype = {

  /**
   * Sets the values on the matrix
   *
   * @param {Number} m11 Row 1, Column 1
   * @param {Number} m12 Row 1, Column 2
   * @param {Number} m13 Row 1, Column 3
   * @param {Number} m21 Row 2, Column 1
   * @param {Number} m22 Row 2, Column 2
   * @param {Number} m23 Row 2, Column 3
   * @param {Number} m31 Row 3, Column 1
   * @param {Number} m32 Row 3, Column 2
   * @param {Number} m33 Row 3, Column 3
   */
  set: function(m11,m12,m13,
          m21,m22,m23,
          m31,m32,m33) {

    this.m11 = m11; this.m12 = m12; this.m13 = m13;
    this.m21 = m21; this.m22 = m22; this.m23 = m23;
    this.m31 = m31; this.m32 = m32; this.m33 = m33;
  },

  /**
   * Turns the columns into rows, and the
   * rows into columns.
   */
  transpose: function() {

    var m12 = this.m12,
        m13 = this.m13,
        m21 = this.m21,
        m23 = this.m23,
        m31 = this.m31,
        m32 = this.m32;

    this.m12 = m21; this.m13 = m31;
    this.m21 = m12; this.m23 = m32;
    this.m31 = m13; this.m32 = m23;
  },

  /**
   * Calculates the determinant of the matrix. Primarily used for inverting the matrix
   *
   * @see <a href="http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/threeD/index.htm">Inverting a 3D Matrix on Euclidean Space</a>
   */
  determinant: function() {

    return this.m11 * this.m22 * this.m33 +
          this.m12 * this.m23 * this.m31 +
          this.m13 * this.m21 * this.m32 -
          this.m11 * this.m23 * this.m32 -
          this.m12 * this.m21 * this.m33 -
          this.m13 * this.m22 * this.m31;
  },

  /**
   * Inverts the matrix
   *
   * @throws An error if the matrix determinant is zero
   */
  invert: function() {

    var m11 = this.m11, m12 = this.m12, m13 = this.m13,
        m21 = this.m21, m22 = this.m22, m23 = this.m23,
        m31 = this.m31, m32 = this.m32, m33 = this.m33,

    determinant = this.determinant();

    if(determinant === 0) {
      throw("Matrix determinant is zero, can't invert.");
    }

    this.m11 = m22 * m33 - m23 * m32;
    this.m12 = m13 * m32 - m12 * m33;
    this.m13 = m12 * m23 - m13 * m22;
    this.m21 = m23 * m31 - m21 * m33;
    this.m22 = m11 * m33 - m13 * m31;
    this.m23 = m13 * m21 - m11 * m23;
    this.m31 = m21 * m32 - m22 * m31;
    this.m32 = m12 * m31 - m11 * m32;
    this.m33 = m11 * m22 - m12 * m21;

    this.scaleByScalar(1 / determinant);

    return this;
  },

  /**
   * Copies the top left 3x3 matrix out of a Matrix4
   *
   * @param {A3.Core.Math.Matrix4} matrix The Matrix4 to copy from
   */
  copyMatrix4: function(matrix) {

    this.m11 = matrix.m11; this.m12 = matrix.m12; this.m13 = matrix.m13;
    this.m21 = matrix.m21; this.m22 = matrix.m22; this.m23 = matrix.m23;
    this.m31 = matrix.m31; this.m32 = matrix.m32; this.m33 = matrix.m33;

    return this;
  },

  /**
   * Scales the whole matrix by a scalar value
   *
   * @param {Number} scalar The value by which to multiply each matrix component
   */
  scaleByScalar: function(scalar) {

    this.m11 *= scalar; this.m12 *= scalar; this.m13 *= scalar;
    this.m21 *= scalar; this.m22 *= scalar; this.m23 *= scalar;
    this.m31 *= scalar; this.m32 *= scalar; this.m33 *= scalar;

    return this;

  },

  /**
   * Converts the Matrix3 to an array suitable for use in WebGL.
   *
   * @param {Float32Array} holder The array to be populated with the matrix data
   * @throws An error if a Float32Array is not provided
   */
  toArray: function(holder) {

    // whinge if a holder isn't
    // provided to the function
    if(!holder) {
      throw "You must provide a Float32Array to populate";
    }

    /*
     * Since this is used for sending data out to WebGL shaders,
     * this populates using columns not rows.
     */
    holder[0] = this.m11; holder[1] = this.m21; holder[2] = this.m31;
    holder[3] = this.m12; holder[4] = this.m22; holder[5] = this.m32;
    holder[6] = this.m13; holder[7] = this.m23; holder[8] = this.m33;

    return holder;
  }
};

// shortcut namespacing
A3.M3 = A3.Core.Math.Matrix3;
