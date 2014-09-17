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

mainFrameCtrl.controller('ProjectCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.line = -1;
        $scope.msgClass = 'alert-success';

        $scope.queryProject = function() {
            $scope.line = -1;
            $http.post('/queryProject', {
                name: $scope.name,
                id: $scope.id,
                description: $scope.description
            }).success(function(res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope.projects = res.projects;
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };

        $scope.modify = function(event) {
            var data = $scope.projects;
            if ($scope.line > -1) {
                data[$scope.line].name = $scope.oldName;
                data[$scope.line].id = $scope.oldId;
                data[$scope.line].description = $scope.oldDescription;
            }
            var target = event.target.parentNode.parentNode;
            var line = target.firstElementChild.textContent - 1;
            if ($scope.line == line) {
                $scope.line = -1;
                return;
            }
            $scope.line = line;
            $scope.oldName = data[$scope.line].name;
            $scope.oldId = data[$scope.line].id;
            $scope.oldDescription = data[$scope.line].description;
        };

        $scope.confirm = function(event) {
            console.log('project: ' +
                JSON.stringify($scope.projects[$scope.line]));
            var target = event.target.parentNode.parentNode;
            var line = target.firstElementChild.textContent - 1;
            if ($scope.line != line) {
                return;
            }
            var data = $scope.projects;
            $http.post('/createProject', {
                name: data[line].name,
                id: data[line].id,
                description: data[line].description,
                option: 'arbitrary'
            }).success(function(res) {
                if (res.status != 'ok') {
                    alert('系统原因，未能成功修改项目信息。\n' + res.message);
                    data[line].name = $scope.oldName;
                    data[line].description = $scope.oldDescription;
                }
                $scope.line = -1;
            }).error(function(err) {
                data[line].name = $scope.oldName;
                data[line].description = $scope.oldDescription;
                $scope.line = -1;
                console.log('project update error: ' + JSON.stringify(err));
                alert('未知外界原因，未能成功修改项目信息');
            });
        };

        $scope.remove = function(event) {
            var data = $scope.projects;
            if ($scope.line > -1) {
                data[$scope.line].name = $scope.oldName;
                data[$scope.line].description = $scope.oldDescription;
            }
            $scope.line = -1;
            var target = event.target.parentNode.parentNode;
            var  line = target.firstElementChild.textContent - 1;
            if (data[line].contract || data[line].file) {
                alert('项目下面有关联的合同或文档, 无法删除该项目。')
            }
            if (!confirm('你确定要删除项目：\n' + data[line].name)) {
                return;
            }
            $http.post('/removeProject', {
                name: data[line].name
            }).success(function(res) {
                if (res.status == 'ok') {
                    $scope.projects.splice(line, 1);
                } else {
                    alert('系统原因，无法删除该项目。\n' + res.message);
                }
            }).error(function(err) {
                alert('未知外界原因，无法删除该项目');
                console.log('project remove error: ' + JSON.stringify(err));
            });
        };
    }
]);

mainFrameCtrl.controller('ProjectDetailCtrl', ['$scope', '$http', '$location',
    function($scope, $http, $location) {
        // 载入页面时默认的项目名，由url参数获取
        $scope.projectName = $location.search()['project'];
        console.log('projectName: ' + $scope.projectName);
        // 初始化$scope.projects
        $scope.projects = [];
        $http.post('/queryProject', {}).success(function (res) {
            $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
            $scope.message = res.message;
            $scope.projects = res.projects;
        }).error(function (res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        var currentProject = function() {
            for (var i = 0; i < $scope.projects.length; i++) {
                if ($scope.projects[i].name == $scope.projectName) {
                    console.log('current project: %j', $scope.projects[i]);
                    return $scope.projects[i];
                }
            }
            return {};
        };

        $scope.$watch(
            "projects",
            function() {
                var cur = currentProject();
                $scope.id = cur.id;
                $scope.description = cur.description;
            }
        );
        $scope.$watch(
            "projectName",
            function() {
                var cur = currentProject();
                $scope.id = cur.id;
                $scope.description = cur.description;
            }
        );

    }
]);

mainFrameCtrl.controller('SubjectCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('VoucherCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.message = '';
        $scope.msgClass = 'alert-success';
        $scope.description = '';

        $scope.queryVoucher = function() {
            //console.log('startDate: ' + $scope.startDate);
            $http.post('/queryVoucher',{
                dateFrom: $scope.dateFrom,
                dateTo: $scope.dateTo,
                timezone: (new Date()).getTimezoneOffset(),
                amountFrom: $scope.amountFrom,
                amountTo: $scope.amountTo,
                voucherId: $scope.voucherId,
                project: $scope.project,
                subjectName: $scope.subjectName,
                description: $scope.description
            }).success(function(res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope.figures = res.figures;
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };

        $scope.toLocalDate = function(time) {
            return (new Date(time)).toLocaleDateString();
        };

        $scope.buttonDisabled = function() {
            return !$scope.queryCondition.amountFrom.$valid ||
                !$scope.queryCondition.amountTo.$valid;
        }
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
            console.log('description: ' + $scope.description);
            $http.post('/createProject', {
                name: $scope.name,
                id: $scope.id,
                description: $scope.description,
                option: 'notArbitrary'
            }).success(function(res) {
                if (res.status == 'ok') {
                    $scope.name = '';
                    $scope.id = '';
                    $scope.description = '';
                    $scope.msgClass = 'alert-success';
                } else {
                    $scope.msgClass = 'alert-danger';
                }
                $scope.message = res.message;
            }).error(function(res) {
                $scope.message = 'system error: ' + JSON.stringify(res);
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

mainFrameCtrl.controller('ImportFigureCtrl', ['$scope', '$http',
    function($scope, $http) {
        // 已导入文件条目列表
        $scope.importedList = [];
        // 有错误的凭证数据
        $scope.errLines = '';
        // 初始化年份数据，从1990年开始至当前
        $scope.years = [];
        for (var i = (new Date()).getFullYear(); i >= 1990; i--) {
            $scope.years.push(i);
        }
        $scope.year = $scope.years[0];
        // 默认导入方式为服务器端本地模式
        $scope.style = 'server';
        // 初始化$scope.projects
        $http.post('/queryProject', {}).success(function(res) {
            $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
            $scope.message = res.message;
            $scope.projects = res.projects;
        }).error(function(res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        // 返回是否已选择批量处理模式
        $scope.batchMode = function() {
            return $scope.style == 'serverBatch' ||
                $scope.style == 'clientBatch';
        };

        // 服务器端本地模式
        $scope.serverModeImport = function() {
            $http.post('/importFigure', {
                style: 'server',
                path: $scope.path,
                projectName: $scope.projectName,
                year: $scope.year
            }).success(function(res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                if (res.errLines) {
                    $scope.errLines += ' #文件名: ' + res.filename + ', ' +
                        '错误位置: ' + JSON.stringify(res.errLines);
                }

                $scope.importedList.push({
                    projectName:res.projectName,
                    year:res.year,
                    path:res.path,
                    filename:res.filename,
                    comment:res.comment,
                    result:res.result
                });
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };
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
            //console.log('startDate: ' + $scope.startDate);
            $http.post('/logReport',{
                startDate: $scope.startDate,
                endDate: $scope.endDate,
                timezone: (new Date()).getTimezoneOffset(),
                operator: $scope.operator,
                operation: $scope.operation,
                target: $scope.target,
                comment: $scope.comment,
                status: $scope.status
            }).success(function(res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope.logMsgs = res.logs;
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };
        $scope.toLocalTime = function(time) {
            return (new Date(time)).toLocaleString();
        }
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
