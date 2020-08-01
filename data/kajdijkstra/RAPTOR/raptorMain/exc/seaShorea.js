raptorjs.seaShore = function(){
	
	this.createSurface();
}

raptorjs.seaShore.prototype.createSurface = function(){
	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/perlin.shader");

	var texture = raptorjs.resources.getTexture("water_bump");
	var g_WaterBumpSampler =  raptorjs.createObject("sampler2D");
	g_WaterBumpSampler.texture = texture;
	g_WaterBumpSampler.useAlpha = true;

	
	
	
	this.perlin = raptorjs.createObject("perlin");
	this.perlin.parent = this;

	var Data = this.perlin.noiseSamples[0][0];
	
	var texture = raptorjs.textureFromArray(Data, sqrt(Data.length / 4),  sqrt(Data.length / 4), true);
	
	this.perlinSamplers = raptorjs.createObject("sampler2D");
	this.perlinSamplers.datatype = gl.RGBA;
	this.perlinSamplers.format = gl.RGBA;
	this.perlinSamplers.internalFormat = gl.RGBA;
	this.perlinSamplers.texture = texture;
	
	this.shader.setUniform("texture",  this.perlinSamplers );
	

	this.surfaceMesh64 = raptorjs.primitives.createPlane(1, 1, 256, 256, "triangleStrip");
	//this.perlin._calculeNoise();
}

var dsa = 0;

raptorjs.seaShore.prototype.render = function() {
	
	dsa++;
	
	var Data = this.perlin.noiseSamples[dsa%99][0];
	
	this.perlinSamplers.texture.data = Data;
	
	this.shader.setUniform("texture",  this.perlinSamplers );
		
	this.shader.setUniform("worldViewProjection", raptorjs.mainCamera.worldViewProjection );
	
	var shaderProgram = this.shader.program;
	

		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	
	gl.useProgram(shaderProgram);
	
	var primitive = this.surfaceMesh64;

	this.shader.update();
	
	var attribute = this.shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, primitive.uvBuffer);
	gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
	
	var attribute = this.shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, primitive.vertexBuffer);
	gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
	
	
	var buffer =  primitive.indexBuffer;
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.drawElements( gl.TRIANGLE_STRIP, primitive.indexBuffer.numItems, raptorjs.system.indexType, 0 );

	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.flush();
}
	



raptorjs.perlin = function(){
	this.perlinSamplers = [];
	
	this.n_bits = 5;
	this.n_size = (1<<(this.n_bits-1));
	this.n_size_m1 = (this.n_size - 1);
	this.n_size_sq = (this.n_size*this.n_size);
	this.n_size_sq_m1 = (this.n_size_sq - 1);
	
	this.n_packsize = 4;
	
	this.np_bits = (this.n_bits+this.n_packsize-1);
	this.np_size = (1<<(this.np_bits-1));
	this.np_size_m1 = (this.np_size-1);
	this.np_size_sq = (this.np_size*this.np_size);
	this.np_size_sq_m1 = (this.np_size_sq-1);

	this.n_dec_bits = 12;
	this.n_dec_magn = 4096;
	this.n_dec_magn_m1 = 4095;

	this.max_octaves = 32;

	this.noise_frames = 256;
	this.noise_frames_m1 = (this.noise_frames-1);

	this.noise_decimalbits = 15;
	this.noise_magnitude = (1<<(this.noise_decimalbits-1));

	this.scale_decimalbits = 15;
	this.scale_magnitude = (1<<(this.scale_decimalbits-1));
	
	this.mOptions = {};
	this.mOptions.Octaves = 8;
	this.mOptions.Falloff = 0.49;
	this.mOptions.Animspeed = 1.4;
	this.mOptions.Timemulti = 1.27;
	this.mOptions.GPU_Strength = 2.0;
	this.mOptions.GPU_LODParameters = [0.5, 50, 150000];
	
	this.o_noise = [];

	this.time = 3.23;
	this.noise = [];
	this.p_noise = [];
	
	this.noiseSamples = [];
	
	this._initNoise();


	
	
	for(var c = 0; c<100; c++) {
		this.update(c * 50);
	}
	
}

raptorjs.perlin.prototype.update = function(deltaTime){
	this._calculeNoise(deltaTime);
	this._updateGPUNormalMapResources();
}

raptorjs.perlin.prototype._initNoise = function()
{	
	// Create noise (uniform)
	var tempnoise = [];//[this.n_size_sq*this.noise_frames]
	var temp;

	var i;
	var frame;
	var v;
	var u; 
	var	v0, v1, v2, u0, u1, u2, f;

	var n_size_sq = this.n_size_sq;
	var noise_frames = this.noise_frames;
	var n_size = this.n_size;
	var n_size_m1 = this.n_size_m1;
	var noise_magnitude = this.noise_magnitude;
	var RAND_MAX = 1;//32767
	
	for(i=0; i<(n_size_sq*noise_frames); i++)
	{
		temp = (Math.random())/RAND_MAX;		
		tempnoise[i] = 4*(temp - 0.5);	
	}	

	for(frame=0; frame<noise_frames; frame++)
	{
		for(v=0; v<n_size; v++)
		{
			for(u=0; u<n_size; u++)
			{	
				v0 = ((v-1)&n_size_m1)*n_size;
				v1 = v*n_size;
				v2 = ((v+1)&n_size_m1)*n_size;
				u0 = ((u-1)&n_size_m1);
				u1 = u;
				u2 = ((u+1)&n_size_m1);				
				f  = frame*n_size_sq;

				temp = (1.0/14.0) *
				   (tempnoise[f + v0 + u0] +      tempnoise[f + v0 + u1] + tempnoise[f + v0 + u2] +
					tempnoise[f + v1 + u0] + 6.0* tempnoise[f + v1 + u1] + tempnoise[f + v1 + u2] +
					tempnoise[f + v2 + u0] +      tempnoise[f + v2 + u1] + tempnoise[f + v2 + u2]);

				this.noise[frame*n_size_sq + v*n_size + u] = noise_magnitude*temp;
			}
		}
		

	
	}

}

	raptorjs.perlin.prototype._updateGPUNormalMapResources = function()
	{
		var Data = [];
		var Offset;
		var np_size_sq = this.np_size_sq;
		
		var textures = [];
		
		for (var k = 0; k < 2; k++)
		{
			Offset = np_size_sq * k;

			for (var u = 0; u < np_size_sq; u++)
			{
			//	console.log(this.p_noise);
				var a = abs(this.p_noise[u+Offset] / 4095);
			
				Data.push(a);
				Data.push(a);

				Data.push(a);
				Data.push(1); 
			}

			textures.push(new Float32Array( Data ));
		}
		
		this.noiseSamples.push(textures);
		
	}
	
	function pow(x,y){ return Math.pow(x,y); }
	
	raptorjs.perlin.prototype._calculeNoise = function(deltaTime)
	{
		var scale_magnitude = this.scale_magnitude;
		var noise_frames_m1 = this.noise_frames_m1;
		var n_size_sq = this.n_size_sq;
		var scale_decimalbits = this.scale_decimalbits;
		var _def_PackedNoise = true;
		var n_packsize = this.n_packsize;
		var np_size = this.np_size;
		var np_size_sq = this.np_size_sq;
		var n_size_m1 = [];
		var n_size = this.n_size;
		

		
		var i, o, v, u;
		var multitable = [];//[max_octaves]
		var amount = []; //[3]
		var iImage;

		var image = []; // [3]

		var sum = 0.0;
		var f_multitable = []; // [max_octaves]

		var mOptions = this.mOptions;
		
		var dImage, fraction;	

		// calculate the strength of each octave
		for(i=0; i<mOptions.Octaves; i++)
		{
			f_multitable[i] = pow(mOptions.Falloff,1.0*i);
			sum += f_multitable[i];
		}

		for(i=0; i<mOptions.Octaves; i++)
		{
			f_multitable[i] /= sum;
		}
		
		for(i=0; i<mOptions.Octaves; i++)
		{
			multitable[i] = scale_magnitude*f_multitable[i];
		}
	
		var r_timemulti = .001;
		var PI_3 = Math.PI/3;

		for(o=0; o<mOptions.Octaves; o++)
		{		
			// fraction = mod(time*r_timemulti,dImage);
			
			var n = deltaTime*r_timemulti;
			
			var dImage = Math.floor(n / 1000);
			var fraction = n % 1000;
			
			iImage = dImage;

			amount[0] = scale_magnitude*f_multitable[o]*(pow(sin((fraction+2)*PI_3),2)/1.5);
			amount[1] = scale_magnitude*f_multitable[o]*(pow(sin((fraction+1)*PI_3),2)/1.5);
			amount[2] = scale_magnitude*f_multitable[o]*(pow(sin((fraction  )*PI_3),2)/1.5);

			image[0] = (iImage  ) & noise_frames_m1;
			image[1] = (iImage+1) & noise_frames_m1;
			image[2] = (iImage+2) & noise_frames_m1;
			
			
			
			for (i=0; i<n_size_sq; i++)
			{
			    this.o_noise[i + n_size_sq*o] = (	
				   ((amount[0] * this.noise[i + n_size_sq * image[0]])>>scale_decimalbits) + 
				   ((amount[1] * this.noise[i + n_size_sq * image[1]])>>scale_decimalbits) + 
				   ((amount[2] * this.noise[i + n_size_sq * image[2]])>>scale_decimalbits));
				   
				   
			}
			
			r_timemulti *= mOptions.Timemulti;
		}

		if(_def_PackedNoise)
		{
			var octavepack = 0;
			for(o=0; o<mOptions.Octaves; o+=n_packsize)
			{
				for(v=0; v<np_size; v++)
				{
					for(u=0; u<np_size; u++)
					{
						
						this.p_noise[v*np_size+u+octavepack*np_size_sq]  = this.o_noise[(o+3)*n_size_sq + (v&n_size_m1)*n_size + (u&n_size_m1)];
						this.p_noise[v*np_size+u+octavepack*np_size_sq] += this._mapSample( u, v, 3, o);
						this.p_noise[v*np_size+u+octavepack*np_size_sq] += this._mapSample( u, v, 2, o+1);
						this.p_noise[v*np_size+u+octavepack*np_size_sq] += this._mapSample( u, v, 1, o+2);		
					}
				}
			
				octavepack++;
			}
		}
	}

	raptorjs.perlin.prototype._mapSample = function(u, v, upsamplepower, octave)
	{
		var magnitude = 1<<upsamplepower;
		var o_noise = this.o_noise;
		var n_size_sq = this.n_size_sq;
		var n_size_m1 = this.n_size_m1;
		var n_size = this.n_size;
		
		    var pu = u >> upsamplepower;
		    var pv = v >> upsamplepower;

		    var fu = u & (magnitude-1);
		    var fv = v & (magnitude-1);

		    var fu_m = magnitude - fu;
		    var fv_m = magnitude - fv;

		    var o = fu_m*fv_m*o_noise[octave*n_size_sq + ((pv)  &n_size_m1)*n_size + ((pu)  &n_size_m1)] +
					fu*  fv_m*o_noise[octave*n_size_sq + ((pv)  &n_size_m1)*n_size + ((pu+1)&n_size_m1)] +
					fu_m*fv*  o_noise[octave*n_size_sq + ((pv+1)&n_size_m1)*n_size + ((pu)  &n_size_m1)] +
					fu*  fv*  o_noise[octave*n_size_sq + ((pv+1)&n_size_m1)*n_size + ((pu+1)&n_size_m1)];

		return o >> (upsamplepower+upsamplepower);
	}
	