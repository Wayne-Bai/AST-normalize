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
    fireDataChangeEvent: function (dataProvider, data, currentPage) {
    	var dataChangeEvent = dataProvider.getEvent("onchange");
    	dataChangeEvent.setParams({
    		data : data,
    		currentPage : currentPage
    	}).fire();
    },
	
    invokeProvide:function(component){
        component.getConcreteComponent().get("c.provide").runDeprecated();
    }
})
