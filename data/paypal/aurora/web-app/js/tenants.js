var ManageTenants = jQuery([]);
ManageTenants.loadTenantUsers = function(tenantId) {
    var url = rootContextPath + '/tenant/_users';
    HeaderUtils.loadUrlIntoElement({
        url:url,
        data:{id:tenantId},
        element:jQuery('#tenant-users'),
        showLoadingMessage:true,
        showLoadingModal:false
    });
};
ManageTenants.validateAndRemoveUser = function(removeBtn, tenantId,userId,roleId) {
    HeaderUtils.showConfirmDialog({
        title:'Please confirm',
        text:jQuery(removeBtn).attr('data-warning'),
        oktext:'Remove User',
        okcallback: function() {
            ManageTenants.removeUser(tenantId,userId,roleId);
            HeaderUtils.closeConfirmDialog();
        },
        cancelcallback: function() {
            HeaderUtils.closeConfirmDialog();
        }
    });
};
ManageTenants.removeUser = function(tenantId,userId,roleId) {
    HeaderUtils.showLoadingModal("Removing User. Please wait...");
    var url = rootContextPath + '/tenant/userRoleDelete.json';
    HeaderUtils.doAjaxJson({
        url:url,
        data:{tenantId:tenantId,userId:userId,roleId:roleId},
        success:function(data) {
            ManageTenants.loadTenantUsers(tenantId);
            HeaderUtils.closeLoadingModal();
        },
        error:function() {
            HeaderUtils.closeLoadingModal();
        }
    });
};
ManageTenants.showAddUserForm = function(tenantId) {
    
    var url = rootContextPath + '/tenant/_addUser';
    HeaderUtils.showConfirmDialog({
        title:'Please confirm',
        url:url,
        oktext:'Add User',
        okcallback: function() {
            ManageTenants.addUser(tenantId,$('select#all-users').val(),$('select#all-roles').val());
            HeaderUtils.closeConfirmDialog();
        },
        cancelcallback: function() {
            HeaderUtils.closeConfirmDialog();
        }
    });
};
ManageTenants.addUser = function(tenantId, userId, roleId) {
    HeaderUtils.showLoadingModal("Adding User. Please wait...");
    var url = rootContextPath + '/tenant/userRoleAdd.json';
    HeaderUtils.doAjaxJson({
        url:url,
        data:{tenantId:tenantId,userId:userId,roleId:roleId},
        success:function(data) {
            ManageTenants.loadTenantUsers(tenantId);
            HeaderUtils.closeLoadingModal();
        },
        error:function() {
            HeaderUtils.closeLoadingModal();
        }
    });

};
