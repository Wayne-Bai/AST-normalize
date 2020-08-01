// Copyright (c) 2012 Srikumar K. S. (http://github.com/srikumarks)
// All rights reserved.
//
// #### License
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/lgpl.html>.

// Must've loaded steller.js before this.
define(["./models/chime",
        "./models/dc",
        "./models/noise",
        "./models/probe",
        "./models/mic",
        "./models/spectrum",
        "./models/load_sample",
        "./models/sample",
        "./models/jsnode",
        "./models/buffer_queue"],
        function (chime, dc, noise, probe, mic, spectrum, load_sample, sample, jsnode, buffer_queue) {

    return function maker(S, sh) {

        var models = sh.models || (sh.models = {});
        models.chime = chime(S, sh);
        models.dc = dc(S, sh);
        models.noise = noise(S, sh);
        models.probe = probe(S, sh);
        models.mic = mic(S, sh);
        models.spectrum = spectrum(S, sh);
        models.load_sample = load_sample(S, sh);
        models.sample = sample(S, sh);
        models.jsnode = jsnode(S, sh);
        models.buffer_queue = buffer_queue(S, sh);

        return models;
    };

});
