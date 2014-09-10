'use strict';

/* App Module */

var archiveApp = angular.module('archiveApp', [
    'ngRoute',
    'mainFrameCtrl',
    'appService'
]);

archiveApp.config(['$routeProvider',
    function($routeProvider) {
        var templateUrl = function(path) {
            return path.type + '/' + path.operation;
        };
        $routeProvider
            .when('/:type/:operation', {
                templateUrl: templateUrl,
                controller: 'WorkplaceCtrl'
            })
            /*
            // archive operation
            .when('/archive/storeManage', {
                templateUrl: '/archive/storeManagement',
                controller: 'StoreManageCtrl'
            })
            .when('/archive/storeQuery', {
                templateUrl: '/archive/storeQuery',
                controller: 'StoreQueryCtrl'
            })
            .when('/archive/storeManagement', {
                templateUrl: '/archive/storeManagement',
                controller: 'StoreManagementCtrl'
            })
            .when('/archive/filing', {
                templateUrl: '/archive/filing',
                controller: 'FilingCtrl'
            })
            .when('/archive/digital', {
                templateUrl: '/archive/digital',
                controller: 'DigitalCtrl'
            })
            .when('/archive/bind', {
                templateUrl: '/archive/bind',
                controller: 'BindCtrl'
            })
            .when('/archive/borrowReturn', {
                templateUrl: '/archive/borrowReturn',
                controller: 'BorrowReturnCtrl'
            })
            .when('/archive/destroy', {
                templateUrl: '/archive/destroy',
                controller: 'DestroyCtrl'
            })
            .when('/archive/report', {
                templateUrl: '/archive/report',
                controller: 'ReportCtrl'
            })
            // query operation
            .when('/search/project', {
                templateUrl: '/search/project',
                controller: 'ProjectCtrl'
            })
            .when('/search/subject', {
                templateUrl: '/search/subject',
                controller: 'SubjectCtrl'
            })
            .when('/search/voucher', {
                templateUrl: '/search/voucher',
                controller: 'VoucherCtrl'
            })
            .when('/search/contract', {
                templateUrl: '/search/contract',
                controller: 'ContractCtrl'
            })
            .when('/search/key', {
                templateUrl: '/search/key',
                controller: 'KeyCtrl'
            })
            .when('/search/document', {
                templateUrl: '/search/document',
                controller: 'DocumentCtrl'
            })
            // create report
            .when('/report/isp', {
                templateUrl: '/report/isp',
                controller: 'IspCtrl'
            })
            .when('/report/pis', {
                templateUrl: '/report/pis',
                controller: 'PisCtrl'
            })
            .when('/report/pst', {
                templateUrl: '/report/pst',
                controller: 'PstCtrl'
            })
            .when('/report/stp', {
                templateUrl: '/report/stp',
                controller: 'StpCtrl'
            })
            // miscellaneous operation
            .when('/tool/createProject', {
                templateUrl: '/tool/createProject',
                controller: 'CreateProjectCtrl'
            })
            .when('/tool/mergeProject', {
                templateUrl: '/tool/mergeProject',
                controller: 'MergeProjectCtrl'
            })
            .when('/tool/addFigure', {
                templateUrl: '/tool/addFigure',
                controller: 'AddFigureCtrl'
            })
            .when('/tool/importFigure', {
                templateUrl: '/tool/importFigure',
                controller: 'ImportFigureCtrl'
            })
            .when('/tool/documentManualBind', {
                templateUrl: '/tool/documentManualBind',
                controller: 'DocumentManualBindCtrl'
            })
            .when('/tool/documentAutoBind', {
                templateUrl: '/tool/documentAutoBind',
                controller: 'DocumentAutoBindCtrl'
            })*/
            // default view
            .otherwise({
                templateUrl: '/help/welcome',
                controller: 'WorkplaceCtrl'
            });
    }
]);

///////////////////////////////////////////////////////////
// used for phoneCat, a template app

var phonecatApp = angular.module('phonecatApp', [
  'ngRoute',
  'phonecatAnimations',

  'phonecatControllers',
  'phonecatFilters',
  'phonecatServices'
]);

phonecatApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/phones', {
        templateUrl: 'partials/phone-list.html',
        controller: 'PhoneListCtrl'
      }).
      when('/phones/:phoneId', {
        templateUrl: 'partials/phone-detail.html',
        controller: 'PhoneDetailCtrl'
      }).
      otherwise({
        redirectTo: '/phones'
      });
  }]);
