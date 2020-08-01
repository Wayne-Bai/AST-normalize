pc.extend(pc, function () {

    /**
     * @name pc.PickMaterial
     * @class A Pick material is for rendering a scene into the frame buffer such that different meshes
     * have different colors that can be queried on a frame buffer read at a specific pixel (normally a
     * click coordinate). This implements frame buffer picking.
     * @property {pc.Color} color The flat color to be written to the frame buffer. RGBA, with each
     * component between 0 and 1.
     */
    var PickMaterial = function () {
        this.color = new pc.Color(1, 1, 1, 1);
        this.colorMap = null;

        this.update();
    };

    PickMaterial = pc.inherits(PickMaterial, pc.Material);

    pc.extend(PickMaterial.prototype, {
        /**
         * @function
         * @name pc.PickMaterial#clone
         * @description Duplicates a Basic material. All properties are duplicated except textures
         * where only the references are copied.
         * @returns {pc.PickMaterial} A cloned Basic material.
         */
        clone: function () {
            var clone = new pc.PickMaterial();

            Material.prototype._cloneInternal.call(this, clone);

            clone.color.copy(this.color);

            clone.update();
            return clone;
        },

        update: function () {
            this.clearParameters();

            this.setParameter('uColor', this.color.data);
        },

        updateShader: function (device) {
            var options = {
                skin: !!this.meshInstances[0].skinInstance
            };
            var library = device.getProgramLibrary();
            this.shader = library.getProgram('pick', options);
        }
    });
    
    return {
        PickMaterial: PickMaterial
    }; 
}());