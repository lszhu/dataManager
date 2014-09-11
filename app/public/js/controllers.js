'use strict';

/* Controllers */

var mainFrameCtrl = angular.module('mainFrameCtrl', []);
mainFrameCtrl.controller('MenuCtrl', ['$scope', 'AppMenu',
    function($scope, AppMenu) {
        $scope.appMenu = AppMenu;
        for (var i = 0; i < $scope.appMenu.length; i++) {
            $scope.appMenu[i].show = 'glyphicon-chevron-down';
        }
        $scope.toggleShow = function(i) {
            $scope.appMenu[i].show =
                    $scope.appMenu[i].show == 'glyphicon-chevron-up' ?
                        'glyphicon-chevron-down' : 'glyphicon-chevron-up';
        }
    }
]);

mainFrameCtrl.controller('FilterKeyCtrl', ['$scope',
    function($scope) {
        $scope.resetKey = function() {
            $scope.filterKey = '';
        }
    }
]);

mainFrameCtrl.controller('WelcomeCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('ProjectCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('SubjectCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('VoucherCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('ContractCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('DocumentCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('KeyCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);


mainFrameCtrl.controller('CreateProjectCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.message = '';
        $scope.msgClass = 'alert-success';
        $scope.name = '';
        $scope.description = '';
        $scope.createProject = function() {
            $http.post('/createProject',
                {name: $scope.name,
                description: $scope.description,
                option: 'notArbitrary'})
                .success(function(res) {
                    if (res.status == 'ok') {
                        $scope.name = '';
                        $scope.description = '';
                        $scope.msgClass = 'alert-success';
                    } else {
                        $scope.msgClass = 'alert-danger';
                    }
                    $scope.message = res.message;
                })
                .error(function(res) {
                    $scope.message = 'system error: ' +
                        JSON.stringify(res);
                });
        };
    }
]);

mainFrameCtrl.controller('MergeProjectCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('AddFigureCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('ImportFigureCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('DocumentAutoBindCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('DocumentManualBindCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

// advanced operation

mainFrameCtrl.controller('subjectManageCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('userManageCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('groupManageCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('logReportCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.message = '';
        $scope.msgClass = 'alert-success';
        $scope.name = '';
        $scope.description = '';
        $scope.logReport = function() {
            $http.post('/logReport',{
                startDate: $scope.startDate,
                endDate: $scope.endDate,
                operator: $scope.operator,
                operation: $scope.operation,
                target: $scope.target,
                comment: $scope.comment,
                status: $scope.status
            }).success(function(res) {
                $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = '';
                $scope.logMsgs = res;
            }).error(function(res) {
                $scope.message = 'system error: ' +
                    JSON.stringify(res);
            });
        };
    }
]);

mainFrameCtrl.controller('systemStatusCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

///////////////////////////////////////////////////////////
// used for phoneCat, a template app

var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$scope', 'Phone',
  function($scope, Phone) {
    $scope.phones = Phone.query();
    $scope.orderProp = 'age';
  }]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone',
  function($scope, $routeParams, Phone) {
    $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
      $scope.mainImageUrl = phone.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);
