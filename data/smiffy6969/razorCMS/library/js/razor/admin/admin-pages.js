/**
 * razorCMS FBCMS
 *
 * Copywrite 2014 to Present Day - Paul Smith (aka smiffy6969, razorcms)
 *
 * @author Paul Smith
 * @site ulsmith.net
 * @created Feb 2014
 */
 
define(["angular", "cookie-monster"], function(angular, monster)
{
	angular.module("razor.admin.pages", [])

	.controller("pages", function($scope, rars, $rootScope)
	{
		$scope.pagesMessage = null;
		$scope.pages = null;

		$scope.loadPages = function()
		{
			// grab page data
			rars.get("page/list", "all").success(function(data)
			{
				$scope.pages = data.pages;
			});
		};
		
		$scope.deletePage = function(pageId)
		{
			$scope.pagesMessage = null;

			rars.delete("page/data", pageId, monster.get("token")).success(function(data)
			{
				$rootScope.$broadcast("global-notification", {"type": "success", "text": "Page deleted successfully."});

				// remove from page array
				angular.forEach($scope.pages, function(page, index)
				{
					if (page.id == pageId) $scope.pages.splice(index, 1);
				});
			}).error(function()
			{
				$rootScope.$broadcast("global-notification", {"type": "danger", "text": "Error deleting page."});
			});
		};

		$scope.editPage = function(pageLink)
		{
			window.location.href = RAZOR_BASE_URL + pageLink;
		};

		$scope.loadPreview = function(link)
		{
			return RAZOR_BASE_URL + link + "?preview";
		};

		$scope.isCurrentPage = function(pageId)
		{
			return (RAZOR_PAGE_ID == pageId ? true : false)
		};

		$scope.makeHomePage = function(pageId)
		{
			rars.post("setting/data", {"home_page": pageId}, monster.get("token")).success(function(data)
			{
				$rootScope.$broadcast("global-notification", {"type": "success", "text": "Home page set successfully."});
				$scope.site.home_page = pageId;
			}).error(function()
			{
				$rootScope.$broadcast("global-notification", {"type": "danger", "text": "Error setting home page, please try again later."});
			});
		};

		$scope.showKeywords = function(keywords)
		{
			return keywords.replace(/,/g, ', ');
		};
	})

	.controller("pagesListAccordion", function($scope)
	{
		$scope.oneAtATime = true;
	});
});