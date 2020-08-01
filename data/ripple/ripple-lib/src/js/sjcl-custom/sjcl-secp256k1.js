// ----- for secp256k1 ------

sjcl.ecc.point.prototype.toBytesCompressed = function () {
  var header = this.y.mod(2).toString() == "0x0" ? 0x02 : 0x03;
  return [header].concat(sjcl.codec.bytes.fromBits(this.x.toBits()))
};

// Replace point addition and doubling algorithms
// NIST-P256 is a=-3, we need algorithms for a=0
//
// This is a custom point addition formula that
// only works for a=-3 Jacobian curve. It's much
// faster than the generic implementation
sjcl.ecc.pointJac.prototype.add = function(T) {
  var S = this;
  if (S.curve !== T.curve) {
    throw("sjcl.ecc.add(): Points must be on the same curve to add them!");
  }

  if (S.isIdentity) {
    return T.toJac();
  } else if (T.isIdentity) {
    return S;
  }

  var z1z1 = S.z.square();
  var h = T.x.mul(z1z1).subM(S.x);
  var s2 = T.y.mul(S.z).mul(z1z1);

  if (h.equals(0)) {
    if (S.y.equals(T.y.mul(z1z1.mul(S.z)))) {
      // same point
      return S.doubl();
    } else {
      // inverses
      return new sjcl.ecc.pointJac(S.curve);
    }
  }

  var hh = h.square();
  var i = hh.copy().doubleM().doubleM();
  var j = h.mul(i);
  var r = s2.sub(S.y).doubleM();
  var v = S.x.mul(i);

  var x = r.square().subM(j).subM(v.copy().doubleM());
  var y = r.mul(v.sub(x)).subM(S.y.mul(j).doubleM());
  var z = S.z.add(h).square().subM(z1z1).subM(hh);

  return new sjcl.ecc.pointJac(this.curve,x,y,z);
};

// This is a custom doubling algorithm that
// only works for a=-3 Jacobian curve. It's much
// faster than the generic implementation
sjcl.ecc.pointJac.prototype.doubl = function () {
  if (this.isIdentity) { return this; }

  var a = this.x.square();
  var b = this.y.square();
  var c = b.square();
  var d = this.x.add(b).square().subM(a).subM(c).doubleM();
  var e = a.mul(3);
  var f = e.square();
  var x = f.sub(d.copy().doubleM());
  var y = e.mul(d.sub(x)).subM(c.doubleM().doubleM().doubleM());
  var z = this.z.mul(this.y).doubleM();
  return new sjcl.ecc.pointJac(this.curve, x, y, z);
};

// DEPRECATED:
// previously the c256 curve was overridden with the secp256k1 curve
// since then, sjcl has been updated to support k256
// this override exist to keep supporting the old c256 with k256 behavior
// this will be removed in future release
sjcl.ecc.curves.c256 = sjcl.ecc.curves.k256;