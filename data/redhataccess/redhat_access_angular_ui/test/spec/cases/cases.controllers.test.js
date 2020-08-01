/*jshint camelcase:false*/
'use strict';
describe('Case Controllers', function () {
    var mockRecommendationsService;
    var mockSearchResultsService;
    var mockStrataService;
    var mockStrataDataService;
    var mockCaseService;
    var mockAttachmentsService;
    var mockGroupService;
    var mockAlertService;
    var mockSearchBoxService;
    var mockSearchCaseService;
    var mockTreeViewSelectorData;
    var mockScope;
    var httpMock;
    var rootScope;
    var q;
    var securityService;
    beforeEach(angular.mock.module('RedhatAccess.cases'));
    beforeEach(angular.mock.module('RedhatAccess.mock'));
    beforeEach(inject(function ($injector, $rootScope, $q, $httpBackend) {
        q = $q;
        mockStrataService = $injector.get('strataService');
        mockCaseService = $injector.get('MockCaseService');
        mockRecommendationsService = $injector.get('MockRecommendationsService');
        mockSearchResultsService = $injector.get('MockSearchResultsService');
        mockStrataDataService = $injector.get('MockStrataDataService');
        mockAttachmentsService = $injector.get('MockAttachmentsService');
        mockGroupService = $injector.get('MockGroupService');
        mockAlertService = $injector.get('MockAlertService');
        mockSearchBoxService = $injector.get('MockSearchBoxService');
        mockSearchCaseService = $injector.get('MockSearchCaseService');
        mockTreeViewSelectorData = $injector.get('MockTreeViewSelectorData');
        securityService = $injector.get('securityService');
        mockScope = $rootScope.$new();
        rootScope = $rootScope;
        httpMock = $httpBackend;
    }));
    //Suite for DetailsSection
    describe('DetailsSection', function () {
        it('should have a function for initializing the selects of case types,product,status,severity and group', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            expect(mockScope.init).toBeDefined();
            mockScope.init();
            spyOn(mockStrataService.values.cases, 'types').andCallThrough();
            spyOn(mockStrataService.groups, 'list').andCallThrough();
            spyOn(mockStrataService.values.cases, 'status').andCallThrough();
            spyOn(mockStrataService.values.cases, 'severity').andCallThrough();
            spyOn(mockStrataService.products, 'list').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.caseTypes).toEqual(mockStrataDataService.mockTypes);
            expect(mockScope.groups).toEqual(mockStrataDataService.mockGroups);
            expect(mockScope.statuses).toEqual(mockStrataDataService.mockStatuses);
            expect(mockCaseService.severities).toEqual(mockStrataDataService.mockSeverities);
        }));
        it('should have a function for initializing the selects rejected', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            expect(mockScope.init).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.values.cases, 'types').andCallThrough();
            spyOn(mockStrataService.groups, 'list').andCallThrough();
            spyOn(mockStrataService.values.cases, 'status').andCallThrough();
            spyOn(mockStrataService.values.cases, 'severity').andCallThrough();
            spyOn(mockStrataService.products, 'list').andCallThrough();
            mockScope.init();
            mockScope.$root.$digest();
            expect(mockScope.caseTypes).toBeUndefined();
            expect(mockScope.groups).toBeUndefined();
            expect(mockScope.statuses).toBeUndefined();
            expect(mockCaseService.severities).toEqual([]);
        }));
        it('should have a function for updating case details resolved', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockScope.caseDetails = {
                $valid: true,
                $setPristine: function () {
                }
            };
            mockScope.caseDetails.summary = {
                $dirty: function () {
                return true;
                }
            };
            mockCaseService.kase.case_number = '1234';
            mockCaseService.kase.type = 'bug';
            mockCaseService.kase.severity = 'high';
            mockCaseService.kase.status = 'open';
            mockCaseService.kase.alternate_id = '12345';
            mockCaseService.kase.product = 'Red Hat Enterprise Linux';
            mockCaseService.kase.version = '6.0';
            mockCaseService.kase.summary = 'Test Summary';
            mockCaseService.kase.group = {
                name: 'Test Group',
                number: '123456'
            };
            mockCaseService.kase.fts = true;
            mockCaseService.kase.contact_info24_x7 = 'test@test.com';
            expect(mockScope.updateCase).toBeDefined();
            mockScope.updateCase();
            spyOn(mockStrataService.cases, 'put').andCallThrough();
            spyOn(mockStrataService.cases.owner, 'update').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.updatingDetails).toBe(false);
        }));
        it('should have a function to get Product Versions resolved', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.product = {
                name: 'Red Hat Enterprise Linux',
                code: '123456'
            };
            expect(mockScope.getProductVersions).toBeDefined();
            mockScope.getProductVersions();
            spyOn(mockStrataService.products, 'versions').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.versions).toEqual(mockStrataDataService.mockVersions);
        }));
        it('should have a function to get Product Versions rejected', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.product = {
                name: 'Red Hat Enterprise Linux',
                code: '123456'
            };
            expect(mockScope.getProductVersions).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.products, 'versions').andCallThrough();
            mockScope.getProductVersions();
            mockScope.$root.$digest();
            expect(mockCaseService.versions).toEqual([]);
        }));
    });
    //Suite for AddCommentSection
    describe('AddCommentSection', function () {
        it('should have a function for adding comments to case resolved', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockScope.saveDraftPromise = '3';
            mockCaseService.kase.status = { name: 'Closed' };
            expect(mockScope.addComment).toBeDefined();
            mockScope.addComment();
            spyOn(mockStrataService.cases.comments, 'post').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.kase.status.name).toEqual('Waiting on Red Hat');
        }));
        it('should have a function for adding comments to case rejected', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockScope.saveDraftPromise = '3';
            mockCaseService.kase.status = { name: 'Closed' };
            expect(mockScope.addComment).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases.comments, 'post').andCallThrough();
            mockScope.addComment();
            mockScope.$root.$digest();
            expect(mockCaseService.kase.status.name).toEqual('Closed');
            expect(mockScope.addingComment).toBe(false);
        }));
        it('should have a function for adding draft comments to case', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockScope.saveDraftPromise = '3';
            mockCaseService.kase.status = { name: 'Closed' };
            mockCaseService.draftComment = {};
            mockCaseService.draftComment.id = '1111';
            expect(mockScope.addComment).toBeDefined();
            mockScope.addComment();
            spyOn(mockStrataService.cases.comments, 'put').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.kase.status.name).toEqual('Waiting on Red Hat');
        }));
        it('should have a function for saving non draft comments', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            expect(mockScope.saveDraft).toBeDefined();
            mockScope.saveDraft();
            spyOn(mockStrataService.cases.comments, 'post').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.draftSaved).toBe(true);
            expect(mockCaseService.draftComment.case_number).toEqual('1234');
        }));
        it('should have a function for saving draft comments', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockCaseService.draftComment = {};
            expect(mockScope.saveDraft).toBeDefined();
            mockScope.saveDraft();
            spyOn(mockStrataService.cases.comments, 'put').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.draftSaved).toBe(true);
            expect(mockCaseService.draftComment.text).toEqual('test comment');
        }));
        it('should have a function for saving draft comments rejected', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockCaseService.draftComment = {};
            expect(mockScope.saveDraft).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases.comments, 'put').andCallThrough();
            mockScope.saveDraft();
            mockScope.$root.$digest();
            expect(mockScope.savingDraft).toBe(false);
        }));
        it('should have a function for on New Comment Keypress', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockScope.addingComment = false;
            mockCaseService.commentText = 'test comment';
            expect(mockScope.onNewCommentKeypress).toBeDefined();
            mockScope.onNewCommentKeypress();
        }));
    });
    //Suite for New
    describe('New', function () {
        it('should have a function for fetching recommendations resolved', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                RecommendationsService: mockRecommendationsService,
                SearchResultsService: mockSearchResultsService,
                strataService: mockStrataService,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.getRecommendations).toBeDefined();
            mockScope.getRecommendations();
            spyOn(mockRecommendationsService, 'populateRecommendations').andCallThrough();
            mockScope.$root.$digest();
            expect(mockSearchResultsService.results).toEqual(mockStrataDataService.mockSolutions);
        }));
        it('should have a function for getting Product Versions resolved', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                RecommendationsService: mockRecommendationsService,
                SearchResultsService: mockSearchResultsService,
                strataService: mockStrataService,
                NEW_DEFAULTS: mockStrataDataService.value
            });
            var product = {
                name: 'Red Hat Enterprise Linux',
                code: '123456'
            };
            expect(mockScope.getProductVersions).toBeDefined();
            mockScope.getProductVersions(product);
            spyOn(mockStrataService.products, 'versions').andCallThrough();
            spyOn(mockStrataService.products, 'get').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.kase.version).toEqual(mockStrataDataService.value.version);
        }));
        it('should have a function for submitting case', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                RecommendationsService: mockRecommendationsService,
                SearchResultsService: mockSearchResultsService,
                strataService: mockStrataService,
                AttachmentsService: mockAttachmentsService,
                NEW_DEFAULTS: mockStrataDataService.value,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            mockCaseService.kase.version = '6.0';
            mockCaseService.kase.summary = 'Test Summary';
            mockCaseService.kase.description = 'Test Description';
            mockCaseService.kase.severity = {
                name: 'high',
                value: '1'
            };
            mockCaseService.kase.product = {
                name: 'Red Hat Enterprise Linux',
                code: '123456'
            };
            mockCaseService.group = 'open';
            mockCaseService.entitlement = 'premium';
            mockCaseService.fts = true;
            mockCaseService.fts_contact = 'testUser@test.com';
            mockCaseService.owner = 'testUser';
            mockCaseService.kase.account = {
                name: 'testAccount',
                number: '12345'
            };
            expect(mockScope.doSubmit).toBeDefined();
            mockScope.doSubmit();
            spyOn(mockStrataService.cases, 'post').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.submittingCase).toBe(false);
        }));
        it('should have a function for initializing the drop downs of product,severity and group', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                //NEW_DEFAULTS: mockStrataDataService.value,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.initSelects).toBeDefined();
            httpMock.expectGET('/productSortList.txt').respond('Red Hat Enterprise Linux,Red Hat JBoss Enterprise Application Platform,Red Hat Satellite or Proxy');
            mockScope.initSelects();
            httpMock.flush();
            spyOn(mockStrataService.products, 'list').andCallThrough();
            spyOn(mockStrataService.values.cases, 'severity').andCallThrough();
            spyOn(mockStrataService.groups, 'list').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.products).toEqual(mockStrataDataService.mockProductList);
            //expect(mockCaseService.kase.product).toEqual(mockStrataDataService.value.product);
            expect(mockCaseService.severities).toEqual(mockStrataDataService.mockSeverities);
            expect(mockCaseService.groups).toEqual(mockStrataDataService.mockGroups);

        }));
        it('should have a function for initializing the drop downs rejected', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                NEW_DEFAULTS: mockStrataDataService.value
            });
            expect(mockScope.initSelects).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.products, 'list').andCallThrough();
            spyOn(mockStrataService.values.cases, 'severity').andCallThrough();
            spyOn(mockStrataService.groups, 'list').andCallThrough();
            mockScope.initSelects();
            mockScope.$root.$digest();
            expect(mockScope.products).toBeUndefined();
            expect(mockCaseService.kase.product).toBeUndefined();
            expect(mockCaseService.severities).toEqual([]);

        }));
        it('should have a function to handle login success event', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                NEW_DEFAULTS: mockStrataDataService.value
            });
            rootScope.$broadcast('auth-login-success');
        }));
    });
    //Suite for RecommendationsSection
    describe('RecommendationsSection', function () {
        it('should have a function to pin Recommendations', inject(function ($controller) {
            $controller('RecommendationsSection', {
                $scope: mockScope,
                RecommendationsService: mockRecommendationsService,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            expect(mockScope.pinRecommendation).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockRecommendationsService.pinnedRecommendations = mockStrataDataService.mockRecommendations;
            mockScope.pinRecommendation(mockStrataDataService.mockSolutionNotPinned, undefined, undefined);
            spyOn(mockStrataService.cases, 'put').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.currentRecPin.pinned).toBe(true);
            expect(mockScope.currentRecPin.pinning).toBe(false);
            expect(mockRecommendationsService.pinnedRecommendations.length).toBe(3);
        }));
        it('should have a function to unpin Recommendations', inject(function ($controller) {
            $controller('RecommendationsSection', {
                $scope: mockScope,
                RecommendationsService: mockRecommendationsService,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            expect(mockScope.pinRecommendation).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockRecommendationsService.pinnedRecommendations = mockStrataDataService.mockRecommendations;
            mockScope.pinRecommendation(mockStrataDataService.mockRecommendationPinned, undefined, undefined);
            spyOn(mockStrataService.cases, 'put').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.currentRecPin.pinned).toBe(false);
            expect(mockScope.currentRecPin.pinning).toBe(false);
            expect(mockRecommendationsService.pinnedRecommendations.length).toBe(1);
        }));
        it('should have a function to pin Recommendations rejected', inject(function ($controller) {
            $controller('RecommendationsSection', {
                $scope: mockScope,
                RecommendationsService: mockRecommendationsService,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            expect(mockScope.pinRecommendation).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases, 'put').andCallThrough();
            mockScope.pinRecommendation(mockStrataDataService.mockSolutionNotPinned, undefined, undefined);
            mockScope.$root.$digest();
            expect(mockScope.currentRecPin.pinned).toBe(false);
            expect(mockScope.currentRecPin.pinning).toBe(false);
        }));
    });
    //Suite for ListNewAttachments
    describe('ListNewAttachments', function () {
        it('should have a function to remove Local Attachment', inject(function ($controller) {
            $controller('ListNewAttachments', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService
            });
            expect(mockScope.removeLocalAttachment).toBeDefined();
            mockAttachmentsService.updatedAttachments = mockStrataDataService.mockAttachments;
            expect(mockAttachmentsService.updatedAttachments.length).toBe(2);
            mockScope.removeLocalAttachment(1);
            expect(mockAttachmentsService.updatedAttachments.length).toBe(1);
        }));
    });
    //Suite for EmailNotifySelect
    describe('EmailNotifySelect', function () {
        it('should have a function to update Notified Users resolved', inject(function ($controller) {
            $controller('EmailNotifySelect', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                EDIT_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.updateNotifyUsers).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockCaseService.originalNotifiedUsers = mockStrataDataService.mockOriginalNotifiedUsers;
            mockCaseService.updatedNotifiedUsers = mockStrataDataService.mockUpdatedNotifiedUsers;
            mockScope.updateNotifyUsers();
            spyOn(mockStrataService.cases.notified_users, 'remove').andCallThrough();
            spyOn(mockStrataService.cases.notified_users, 'add').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.updatingList).toBe(false);
            expect(mockCaseService.updatedNotifiedUsers).toEqual(mockCaseService.originalNotifiedUsers);
        }));
        it('should have a function to update Notified Users rejected', inject(function ($controller) {
            $controller('EmailNotifySelect', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                EDIT_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.updateNotifyUsers).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockCaseService.originalNotifiedUsers = mockStrataDataService.mockOriginalNotifiedUsers;
            mockCaseService.updatedNotifiedUsers = mockStrataDataService.mockUpdatedNotifiedUsers;
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases.notified_users, 'remove').andCallThrough();
            spyOn(mockStrataService.cases.notified_users, 'add').andCallThrough();
            mockScope.updateNotifyUsers();
            mockScope.$root.$digest();
            expect(mockScope.updatingList).toBe(false);
            expect(mockCaseService.updatedNotifiedUsers).toEqual(mockStrataDataService.mockUpdatedNotifiedUsers);
        }));
    });
    //Suite for DeleteGroupButton
    describe('DeleteGroupButton', function () {
        it('should have a function to delete Groups resolved', inject(function ($controller) {
            $controller('DeleteGroupButton', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService
            });
            expect(mockScope.deleteGroups).toBeDefined();
            mockCaseService.groups = mockStrataDataService.mockGroups;
            mockScope.deleteGroups();
            spyOn(mockStrataService.groups, 'remove').andCallThrough();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('Successfully deleted groups.');
        }));
        it('should have a function to delete Groups rejected', inject(function ($controller) {
            $controller('DeleteGroupButton', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService
            });
            expect(mockScope.deleteGroups).toBeDefined();
            mockCaseService.groups = mockStrataDataService.mockGroups;
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.groups, 'remove').andCallThrough();
            mockScope.deleteGroups();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('Deleting groups...');
            expect(mockAlertService.alerts[1].message).toEqual('strata error');
        }));
    });
    //Suite for CreateGroupModal
    describe('CreateGroupModal', function () {
        it('should have a function to create a Group resolved', inject(function ($controller) {
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $modalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.createGroup).toBeDefined();
            mockScope.createGroup();
            spyOn(mockStrataService.groups, 'create').andCallThrough();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toContain('Successfully created group');
            expect(mockCaseService.groups[0].number).toEqual(mockStrataDataService.mockGroups[0].number);
        }));
        it('should have a function to create a Group rejected', inject(function ($controller) {
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $modalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.createGroup).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.groups, 'create').andCallThrough();
            mockScope.createGroup();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('strata error');
            expect(mockAlertService.alerts[0].type).toEqual('danger');
        }));
        it('should have a function to close Modal window', inject(function ($controller) {
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $modalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.closeModal).toBeDefined();
            mockScope.closeModal();
        }));
        it('should have a function to trigger create group on GroupName KeyPress', inject(function ($controller) {
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $modalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.onGroupNameKeyPress).toBeDefined();
            var event = { 'keyCode': 13 };
            mockScope.onGroupNameKeyPress(event);
        }));
    });
    //Suite for CompactEdit
    describe('CompactEdit', function () {
        it('should have a function to initialize the compact case edit screen resolved', inject(function ($controller) {
            $controller('CompactEdit', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                AttachmentsService: mockAttachmentsService,
                AlertService: mockAlertService,
                $stateParams: mockStrataDataService.value,
                $modalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.init).toBeDefined();
            mockScope.init();
            spyOn(mockStrataService.cases, 'get').andCallThrough();
            spyOn(mockStrataService.products, 'versions').andCallThrough();
            spyOn(mockStrataService.cases.attachments, 'list').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.versions).toEqual(mockStrataDataService.mockVersions);
            expect(mockAttachmentsService.originalAttachments).toEqual(mockStrataDataService.mockAttachments);
        }));
        it('should have a function to initialize the compact case edit screen rejected', inject(function ($controller) {
            $controller('CompactEdit', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                AttachmentsService: mockAttachmentsService,
                AlertService: mockAlertService,
                $stateParams: mockStrataDataService.value,
                $modalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.init).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases, 'get').andCallThrough();
            spyOn(mockStrataService.products, 'versions').andCallThrough();
            spyOn(mockStrataService.cases.attachments, 'list').andCallThrough();
            mockScope.init();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('strata error');
            expect(mockAlertService.alerts[0].type).toEqual('danger');
            expect(mockAttachmentsService.originalAttachments).toEqual([]);
        }));
    });
    //Suite for SearchBox
    describe('SearchBox', function () {
        it('should have a function to do search on filter key press', inject(function ($controller) {
            $controller('SearchBox', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onFilterKeyPress).toBeDefined();
            var event = { 'keyCode': 13 };
            mockScope.onFilterKeyPress(event);
        }));
        it('should have a function to to check key press', inject(function ($controller) {
            $controller('SearchBox', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onFilterKeyPress).toBeDefined();
            var event = { 'keyCode': 14 };
            mockScope.onFilterKeyPress(event);
        }));
    });
    //Suite for Search
    describe('Search', function () {
        it('should have a function to select case list page', inject(function ($controller) {
            $controller('Search', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchCaseService: mockSearchCaseService
            });
            expect(mockScope.selectPage).toBeDefined();
            mockScope.selectPage(1);
            spyOn(mockSearchCaseService, 'doFilter').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.casesOnScreen).toEqual(mockStrataDataService.mockCases);
        }));
        it('should have a function to show empty case list when page number exceeds ', inject(function ($controller) {
            $controller('Search', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchCaseService: mockSearchCaseService
            });
            expect(mockScope.selectPage).toBeDefined();
            mockScope.selectPage(5);
            spyOn(mockSearchCaseService, 'doFilter').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.casesOnScreen).toEqual([]);
        }));
        it('should have a function to select case list page with all cases downloaded', inject(function ($controller) {
            $controller('Search', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchCaseService: mockSearchCaseService
            });
            expect(mockScope.selectPage).toBeDefined();
            mockSearchCaseService.allCasesDownloaded = true;
            mockScope.selectPage(1);
            spyOn(mockSearchCaseService, 'doFilter').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.casesOnScreen).toEqual(mockStrataDataService.mockCases);
        }));
        it('should have a function to handle login success event', inject(function ($controller) {
            $controller('Search', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchCaseService: mockSearchCaseService
            });
            expect(mockSearchCaseService.cases).toEqual(mockStrataDataService.mockCases);
            rootScope.$broadcast('auth-login-success');
            expect(mockSearchCaseService.cases).toEqual([]);
        }));
        it('should have a function to handle logout success event', inject(function ($controller) {
            $controller('Search', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchCaseService: mockSearchCaseService
            });
            mockCaseService.kase = mockStrataDataService.mockCases[0];
            rootScope.$broadcast('auth-logout-success');
            expect(mockCaseService.kase).toEqual({});
        }));
    });
    //Suite for AttachLocalFile
    describe('AttachLocalFile', function () {
        it('should have a function to clear filename and file description', inject(function ($controller) {
            $controller('AttachLocalFile', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService
            });
            mockScope.fileName = 'test_file';
            mockScope.fileDescription = 'test_description';
            expect(mockScope.clearSelectedFile).toBeDefined();
            mockScope.fileName = 'Test fileName';
            mockScope.fileDescription = 'Test file description';
            mockScope.clearSelectedFile();
            expect(mockScope.fileName).toEqual('No file chosen');
            expect(mockScope.fileDescription).toEqual('');
        }));
        it('should have a function to get selected file', inject(function ($controller) {
            $controller('AttachLocalFile', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService,
                AlertService: mockAlertService
            });
            var file = {
                files: [{
                    size: 32323,
                    name: 'gfdsfds'
                }]
            };
            var fileUploader = [file];
            spyOn(window, '$').andReturn(fileUploader);
            expect(mockScope.selectFile).toBeDefined();
            mockScope.selectFile();
        }));
        it('should add file to the list of attachments', inject(function ($controller) {
            $controller('AttachLocalFile', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService
            });
            mockScope.fileObj = 'test_data';
            mockScope.fileDescription = 'test_description';
            mockScope.fileName = 'test_file';
            mockScope.fileSize = '200MB';
            expect(mockScope.addFile).toBeDefined();
            mockScope.addFile();
            expect(mockAttachmentsService.updatedAttachments.length).toEqual(1);
            expect(mockAttachmentsService.updatedAttachments[0].description).toEqual('test_description');
        }));
    });
    //Suite for ExportCSVButton
    describe('ExportCSVButton', function () {
        it('shoud have a function to export all cases as CSV resolved', inject(function ($controller) {
            $controller('ExportCSVButton', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService
            });
            expect(mockScope.exports).toBeDefined();
            mockScope.exports();
            spyOn(mockStrataService.cases, 'csv').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.exporting).toEqual(false);
        }));
        it('shoud have a function to export all cases as CSV rejected', inject(function ($controller) {
            $controller('ExportCSVButton', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService
            });
            expect(mockScope.exports).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases, 'csv').andCallThrough();
            mockScope.exports();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('strata error');
        }));
    });
    //Suite for Edit
    describe('Edit', function () {
        it('should have a function to initialize the case edit page rejected', inject(function ($controller) {
            $controller('Edit', {
                $scope: mockScope,
                $stateParams: mockStrataDataService.value,
                EDIT_CASE_CONFIG: mockStrataDataService.value,
                AttachmentsService: mockAttachmentsService,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                RecommendationsService: mockRecommendationsService,
                AlertService: mockAlertService
            });
            mockScope.failedToLoadCase = true;
            expect(mockScope.init).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases, 'get').andCallThrough();
            spyOn(mockStrataService.products, 'versions').andCallThrough();
            spyOn(mockStrataService.accounts, 'get').andCallThrough();
            spyOn(mockStrataService.cases.attachments, 'list').andCallThrough();
            spyOn(mockStrataService.cases.comments, 'get').andCallThrough();
            mockScope.init();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('Unable to retrieve case.  Please be sure case number is valid.');
        }));
    });
    //Suite for AttachmentsSection
    describe('AttachmentsSection', function () {
        it('should have a function to update attachement in attachment list', inject(function ($controller) {
            $controller('AttachmentsSection', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService,
                CaseService: mockCaseService
            });
            expect(mockScope.doUpdate).toBeDefined();
            mockCaseService.kase.case_number = '12345';
            mockScope.doUpdate();
            spyOn(mockAttachmentsService, 'updateAttachments').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.updatingAttachments).toEqual(false);
            expect(mockAttachmentsService.updatedAttachments).toContain(mockStrataDataService.mockAttachments[0]);
        }));
    });
    //Suite for CompactCaseList
    describe('CompactCaseList', function () {
        it('should have a function to set the selected case index', inject(function ($controller) {
            $controller('CompactCaseList', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                SearchCaseService: mockSearchCaseService,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.selectCase).toBeDefined();
            mockScope.selectCase(1);
            expect(mockScope.selectedCaseIndex).toEqual(1);
        }));
        it('should have a function to handle login success event', inject(function ($controller) {
            $controller('CompactCaseList', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                SearchCaseService: mockSearchCaseService,
                SearchBoxService: mockSearchBoxService
            });
            rootScope.$broadcast('auth-login-success');
            spyOn(mockSearchCaseService, 'doFilter');
            mockScope.$root.$digest();
            expect(mockCaseService.groups).toEqual(mockStrataDataService.mockGroups);
            expect(mockScope.domReady).toBe(true);
        }));
    });
    //Suite for GroupList
    describe('GroupList', function () {
        it('should have a function to handle Master Checkbox Click', inject(function ($controller) {
            $controller('GroupList', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                GroupService: mockGroupService,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onMasterCheckboxClicked).toBeDefined();
            mockGroupService.groupsOnScreen = mockStrataDataService.mockGroups;
            mockScope.onMasterCheckboxClicked();
            expect(mockGroupService.groupsOnScreen[0].selected).toBe(false);
        }));
        it('should have a function to handle group select Click', inject(function ($controller) {
            $controller('GroupList', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                GroupService: mockGroupService,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onGroupSelected).toBeDefined();
            mockGroupService.groupsOnScreen = mockStrataDataService.mockGroups;
            mockScope.onGroupSelected();
            expect(mockGroupService.disableDeleteGroup).toBe(false);
        }));
    });
    //Suite for StatusSelect
    describe('StatusSelect', function () {
        it('should have status of cases as open', inject(function ($controller) {
            $controller('StatusSelect', {
                $scope: mockScope,
                CaseService: mockCaseService,
                STATUS: mockStrataDataService.mockStatus
            });
            expect(mockScope.STATUS).toEqual(mockStrataDataService.mockStatus);
            expect(mockScope.statuses[0].name).toEqual('Open and Closed');
            expect(mockScope.statuses[1].name).toEqual('Open');
            expect(mockScope.statuses[2].name).toEqual('Closed');
        }));
    });
    //Suite for AccountSelect
    describe('AccountSelect', function () {
        it('should have a function to fetch user account number resolved', inject(function ($controller) {
            $controller('AccountSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            expect(mockScope.selectUserAccount).toBeDefined();
            mockScope.selectUserAccount();
            spyOn(mockStrataService.accounts, 'list').andCallThrough();
            mockScope.$root.$digest();
            expect(mockScope.loadingAccountNumber).toEqual(false);
            expect(mockCaseService.users).toEqual(mockStrataDataService.mockUsers);
            expect(mockCaseService.account.number).toEqual(mockStrataDataService.mockAccount[0].account_number);
        }));
        it('should have a function to fetch user account number rejected', inject(function ($controller) {
            $controller('AccountSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            expect(mockScope.selectUserAccount).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.accounts, 'list').andCallThrough();
            mockScope.selectUserAccount();
            mockScope.$root.$digest();
            expect(mockScope.loadingAccountNumber).toEqual(false);
            expect(mockCaseService.account.number).toBeUndefined();
            expect(mockAlertService.alerts[0].message).toEqual('strata error');
        }));
        it('should have a function to populate account specific fields', inject(function ($controller) {
            $controller('AccountSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            expect(mockScope.populateAccountSpecificFields).toBeDefined();
            mockScope.alertInstance = 'Account found';
            mockScope.populateAccountSpecificFields();
            spyOn(mockStrataService.accounts, 'get').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.users).toEqual([]);
        }));
    });
    //Suite for SeveritySelect
    describe('SeveritySelect', function () {
        it('should load all the case severities resolved', inject(function ($controller) {
            $controller('SeveritySelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            spyOn(mockStrataService.values.cases, 'severity').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.severities).toEqual(mockStrataDataService.mockSeverities);
        }));
    });
    //Suite for TypeSelect
    describe('TypeSelect', function () {
        it('should load all the case types resolved', inject(function ($controller) {
            $controller('TypeSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            spyOn(mockStrataService.values.cases, 'types').andCallThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.types).toEqual(mockStrataDataService.mockTypes);
        }));
    });
    //Suite for ProductSelect
    describe('ProductSelect', function () {
        it('should load all the products resolved', inject(function ($controller) {
            $controller('ProductSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService
            });
            spyOn(mockStrataService.products, 'list');
            mockScope.$root.$digest();
            expect(mockCaseService.products).toEqual(mockStrataDataService.mockProducts);
        }));
    });
    //Suite for EntitlementSelect
    describe('EntitlementSelect', function () {
        it('should have a function to do blah!', inject(function ($controller) {
            $controller('EntitlementSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AlertService: mockAlertService
            });
            expect(mockCaseService.entitlements).toEqual(mockStrataDataService.mockEntitlements);
        }));
    });
    //Suite for Group
    describe('Group', function () {
        it('should have a function to do blah!', inject(function ($controller) {
            $controller('Group', {
                $scope: mockScope,
                GroupService: mockGroupService,
                SearchBoxService: mockSearchBoxService
            });
        }));
    });
    //Suite for List
    describe('List', function () {
        it('should have a function to handle login success event', inject(function ($controller) {
            $controller('List', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchBoxService: mockSearchBoxService
            });
            mockSearchCaseService.cases = mockStrataDataService.mockCases;
            securityService.loginStatus.userAllowedToManageCases = true;
            rootScope.$broadcast('auth-login-success');
            spyOn(mockSearchBoxService, 'doSearch');
            mockScope.$root.$digest();
            expect(mockScope.tableParams).toBeDefined();
        }));
    });
    //Suite for ListFilter
    describe('ListFilter', function () {
        it('should default case filter status to OPEN', inject(function ($controller) {
            $controller('ListFilter', {
                $scope: mockScope,
                STATUS: mockStrataDataService.mockStatus,
                CaseService: mockCaseService
            });
            expect(mockCaseService.status).toEqual(mockStrataDataService.mockStatus.open);
        }));
    });
    //Suite for CreateGroupButton
    describe('CreateGroupButton', function () {
        var mockModal = jasmine.createSpyObj('modal', ['open']);
        it('should have a function to open Create Group Dialog', inject(function ($controller) {
            $controller('CreateGroupButton', {
                $scope: mockScope,
                $modal: mockModal
            });
            expect(mockScope.openCreateGroupDialog).toBeDefined();
            mockScope.openCreateGroupDialog();
        }));
    });
    //Suite for DescriptionSection
    describe('DescriptionSection', function () {
        it('should have a function to do blah!', inject(function ($controller) {
            $controller('DescriptionSection', {
                $scope: mockScope,
                CaseService: mockCaseService
            });
        }));
    });
    //Suite for BackEndAttachmentsCtrl
    describe('BackEndAttachmentsCtrl', function () {
        it('should have a function to do blah!', inject(function ($controller) {
            $controller('BackEndAttachmentsCtrl', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService,
                NEW_CASE_CONFIG: mockStrataDataService.value,
                EDIT_CASE_CONFIG: mockStrataDataService.value,
                TreeViewSelectorData: mockTreeViewSelectorData
            });
            spyOn(mockTreeViewSelectorData, 'getTree');
            mockScope.$root.$digest();
            expect(mockAttachmentsService.backendAttachments).toEqual(mockStrataDataService.mockAttachments);
            expect(mockScope.attachmentTree).toEqual(mockStrataDataService.mockAttachments);
        }));
    });
});
