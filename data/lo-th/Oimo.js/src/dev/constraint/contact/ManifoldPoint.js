/**
* The class holds details of the contact point.
* @author saharan
*/
OIMO.ManifoldPoint = function(){
    // Whether this manifold point is persisting or not.
    this.warmStarted=false;
    //  The position of this manifold point.
    this.position=new OIMO.Vec3();
    // The position in the first shape's coordinate.
    this.localPoint1=new OIMO.Vec3();
    //  The position in the second shape's coordinate.
    this.localPoint2=new OIMO.Vec3();
    // The normal vector of this manifold point.
    this.normal=new OIMO.Vec3();
    // The tangent vector of this manifold point.
    this.tangent=new OIMO.Vec3();
    // The binormal vector of this manifold point.
    this.binormal=new OIMO.Vec3();
    // The impulse in normal direction.
    this.normalImpulse=0;
    // The impulse in tangent direction.
    this.tangentImpulse=0;
    // The impulse in binormal direction.
    this.binormalImpulse=0;
    // The denominator in normal direction.
    this.normalDenominator=0;
    // The denominator in tangent direction.
    this.tangentDenominator=0;
    // The denominator in binormal direction.
    this.binormalDenominator=0;
    // The depth of penetration.
    this.penetration=0;
}