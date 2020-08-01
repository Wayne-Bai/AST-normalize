/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    /**
     * Accepts a map of localid:qualifiedName of components to be lazy loaded.
     * For example: {'textNode':'markup://aura:text',
     * "numNode":'markup://ui:outputNumber'}
     */
    verifyLazyLoading : function(cmp, lazyCmpId_qualifiedName_map, waitIds, callbackAfterLoad) {
        for (var lazyCmpId in lazyCmpId_qualifiedName_map) {
            $A.test.assertEquals("markup://aura:placeholder",
                                 cmp.find(lazyCmpId).getDef().getDescriptor().getQualifiedName(),
                                 "Expected component with local id '"+lazyCmpId
                                 +"' to be initially represented by a placeholder.");
        }
        waitIds = $A.util.isArray(waitIds) ? waitIds : [waitIds];
        var id;
        for(id = 0; id < waitIds.length; id++) {
            this.resumeGateId(cmp, waitIds[id]);
        }
        //Wait till all specified facets marked with aura:load are replaced by actual components,
        //and then call callbackAfterLoad()
        $A.test.addWaitFor(true, function(){
                var ret = true;
                for (var lazyCmpId in lazyCmpId_qualifiedName_map) {
                    ret = ret && (lazyCmpId_qualifiedName_map[lazyCmpId]
                                  == cmp.find(lazyCmpId).getDef().getDescriptor().getQualifiedName());
                }
                return ret;
            },
            callbackAfterLoad
        );
    },

    /**
     * Resume a single wait ID, and set up a cleanup for it.
     *
     * @param cmp the component with the gated component
     * @param waitId the waitId to release.
     */
    resumeGateId : function(cmp, waitId) {
        var resume = cmp.get("c.resumeGateId");
        resume.setParams({"waitId":waitId});
        $A.test.callServerAction(resume, true);
        var clear = cmp.get("c.clearGateId");
        clear.setParams({"waitId":waitId});
        $A.test.addCleanup(function () { $A.test.callServerAction(clear, true); });
    }
})
