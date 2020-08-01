/**
 * Copyright 2012 Google, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @author benvanik@google.com (Ben Vanik)
 */

goog.provide('gf.sim.commands');

goog.require('gf.sim.CommandFactory');
goog.require('gf.sim.commands.ReparentCommand');


/**
 * Registers all GF commands with a simulator.
 * @param {!gf.sim.Simulator} simulator Simulator.
 */
gf.sim.commands.registerCommands = function(simulator) {
  // REPARENT
  simulator.registerCommandFactory(new gf.sim.CommandFactory(
      gf.sim.commands.ReparentCommand.ID,
      gf.sim.commands.ReparentCommand,
      gf.sim.commands.ReparentCommand.FLAGS));
};
