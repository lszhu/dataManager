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
        };

        $scope.$watch(
            'globalFilterKey',
            function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.$emit('globalFilterKey', {key: newValue});
            }
        );

        $scope.$on('$locationChangeStart', function() {
            $scope.globalFilterKey = '';
        });

        //$scope.$on('resetGlobalFilterKey', function() {
        //    $scope.globalFilterKey = '';
        //});
    }
]);

mainFrameCtrl.controller('FilterKeyCtrl', ['$scope',
    function($scope) {
        //$scope.$on('$locationChangeStart', function() {
        //    $scope.$broadcast('globalFilterKey', {key: ''});
        //});

        $scope.$on('globalFilterKey', function(event, data) {
            //$scope.$broadcast('globalFilterKey', data);
            $scope.globalFilterKey = data.key;
        });

        //$scope.$on('resetGlobalFilterKey', function() {
        //    $scope.$broadcast('globalFilterKey');
        //});
    }
]);

mainFrameCtrl.controller('WelcomeCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('StorageManageCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('CabinetManageCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('FoldManageCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('QueryStoreCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('FilingCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('QueryProjectCtrl', ['$scope', '$http', '$location',
    function($scope, $http, $location) {
        //$scope.line = -1;
        $scope.msgClass = 'alert-success';
        // 用于保存临时编辑的项目
        $scope.tmpProject = {};
        // 保存项目未改名前的名称
        $scope.originalName = '';

        $scope.queryProject = function() {
            //$scope.line = -1;
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

        $scope.gotoProjectDetail = function(name) {
            $location.path('/search/queryProjectDetail')
                .search('project', name);
        };

        var initTmpProject = function(project) {
            //$scope.tmpProject = {};
            //$scope.tmpProject.name = project.name;
            $scope.tmpProject.newName = project.name;
            $scope.tmpProject.id = project.id;
            $scope.tmpProject.description = project.description;
            $scope.tmpProject.parent = project.parent;
            $scope.tmpProject.children = project.children ?
                project.children.slice(0) : [];
            $scope.tmpProject.contract = project.contract ?
                project.contract.slice(0) : [];
            $scope.tmpProject.file = project.file ?
                project.file.slice(0) : [];
        };

        $scope.modify = function(name) {
            var oldProject = $scope.projects
                .filter(function(e) {return e.edit;})[0];
            if (oldProject) {
                oldProject.edit = false;
            }
            //if (oldProject) {
            //    oldProject.name = $scope.oldName;
            //    oldProject.id = $scope.oldId;
            //    oldProject.description = $scope.oldDescription;
            //    oldProject.edit = false;
            //}

            var project = $scope.projects
                .filter(function(e) {return e.name == name;})[0];
            if (!project) {
                alert('项目名称有误！');
                return;
            }
            project.edit = true;
            //initTmpProject(project);
            $scope.tmpProject.newName = project.name;
            $scope.tmpProject.id = project.id;
            $scope.tmpProject.description = project.description;
            $scope.originalName = project.name;
            console.log('originalName: %o', $scope.originalName);
            //$scope.oldName = project.name;
            //$scope.oldId = project.id;
            //$scope.oldDescription = project.description;
        };

        $scope.confirm = function(name) {
            var project = $scope.projects
                .filter(function(e) {return e.name == name;})[0];
            if (!project.edit) {
                return;
            }
            project.edit = false;

            var uploadData = {
                option: 'arbitrary',
                name: $scope.originalName,
                newName: $scope.tmpProject.newName,
                id: $scope.tmpProject.id,
                description: $scope.tmpProject.description,
                parent: project.parent,
                children: project.children,
                contract: project.contract,
                file: project.file
            };
            console.log('uploadData: %o', uploadData);
            $http.post('/updateProject', uploadData)
                .success(function(res) {
                    if (res.status == 'duplicateName') {
                        alert('系统中已存在项目名称：'
                            + $scope.tmpProject.newName);
                    } else if (res.status != 'ok') {
                        alert('系统原因导致未能修改成功：\n' + res.message);
                        //project.name = $scope.oldName;
                        //project.description = $scope.oldDescription;
                    } else {
                        $scope.queryProject();
                        //for (var i = 0; i < $scope.projects.length; i++) {
                        //    if ($scope.projects[i].name == name) {
                        //        uploadData.name = uploadData.newName;
                        //        $scope.projects[i] = uploadData;
                        //        break;
                        //    }
                        //}
                    }
                    //$scope.line = -1;
                }).error(function(err) {
                    //project.name = $scope.oldName;
                    //project.description = $scope.oldDescription;
                    //$scope.line = -1;
                    console.log('project update error: %o', err);
                    alert('未知外界原因，未能成功修改项目信息');
                });
        };

        $scope.remove = function(name) {
            var project = $scope.projects
                .filter(function(e) {return e.name == name;})[0];
            if (!project) {
                alert('项目名称有误！');
                return;
            }

            if (!confirm('你确定要删除项目：\n' + project.name)) {
                return;
            }
            $http.post('/removeProject', project)
                .success(function(res) {
                    if (res.status == 'ok') {
                        $scope.projects = $scope.projects.filter(function(e) {
                            return e.name != project.name;
                        });
                    } else if (res.status == 'parentProject') {
                        alert('删除项目失败：\n' + res.message);
                    } else {
                        alert('系统原因，无法删除该项目：\n' + res.message);
                    }
                }).error(function(err) {
                    alert('未知外界原因，无法删除该项目');
                    console.log('project remove error: %o', err);
                });
        };
    }
]);

mainFrameCtrl.controller('ProjectDetailCtrl', ['$scope', '$http', '$location',
    'filterFilter', function($scope, $http, $location, filterFilter) {
        // 载入页面时默认的项目名，由url参数获取
        $scope.projectName = $location.search()['project'];
        console.log('projectName: ' + $scope.projectName);
        // 用于保存临时编辑的项目
        $scope.tmpProject = {};
        // 控制修改隶属父项目
        $scope.parentReadonly = true;
        // 用于临时保存选中项目
        $scope.childrenProject = {};
        // 保存从服务器获取的原始资料
        $scope.projectsRaw = [];

        var initTmpProject = function(project) {
            $scope.tmpProject = {};
            $scope.tmpProject.name = project.name;
            $scope.tmpProject.id = project.id;
            $scope.tmpProject.description = project.description;
            $scope.tmpProject.parent = project.parent;
            $scope.tmpProject.children = project.children ?
                project.children.slice(0) : [];
            $scope.tmpProject.contract = project.contract ?
                project.contract.slice(0) : [];
            $scope.tmpProject.file = project.file ?
                project.file.slice(0) : [];

            $scope.parentReadonly = true;
            // 根据当前指定project初始化子项目选中情况
            var children = $scope.tmpProject.children;
            children = children ? children : [];
            for (var i = 0; i < $scope.projectsRaw.length; i++) {
                var name = $scope.projectsRaw[i].name;
                $scope.childrenProject[name] =
                    children.some(function(e) {return e == name;});
            }
        };

        var queryProject = function() {
            $http.post('/queryProject', {}).success(function (res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope.projectsRaw = res.projects;
                $scope.projects = res.projects;
                $scope.parentProjects = res.projects;
                if (!$scope.projectName &&
                    $scope.projectsRaw && $scope.projectsRaw.length) {
                    $scope.projectName = $scope.projectsRaw[0].name;
                    initTmpProject($scope.projectsRaw[0]);
                }
            }).error(function (res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };
        queryProject();

        var currentProject = function() {
            if (!$scope.projects) {
                return {};
            }
            for (var i = 0; i < $scope.projects.length; i++) {
                if ($scope.projects[i].name == $scope.projectName) {
                    //console.log('current project: %j', $scope.projects[i]);
                    return $scope.projects[i];
                }
            }
            return {};
        };

        $scope.editParent = function() {
            $scope.parentReadonly = false;
            $scope.filterParentKey = '';
        };

        $scope.confirmModify = function() {
            var project = $scope.projectsRaw.filter(function(e) {
                return e.name == $scope.tmpProject.name;
            })[0];
            $scope.tmpProject.option = 'arbitrary';
            console.log('project: %o', $scope.tmpProject);

            $http.post('/updateProject', $scope.tmpProject)
                .success(function(res) {
                    if (res.status != 'ok') {
                        alert('未能修改成功：\n' + res.message);
                        initTmpProject(project);
                        console.log('project: %o', project);
                    } else {
                        for (var i = 0; i < $scope.projectsRaw.length; i++) {
                            if ($scope.projects[i].name == project.name) {
                                $scope.projects[i] = $scope.tmpProject;
                                break;
                            }
                        }
                        initTmpProject($scope.tmpProject);
                    }
                    queryProject();
                }).error(function(err) {
                    console.log('project update error: %o', err);
                    alert('未知外界原因导致修改项目信息失败');
                    initTmpProject(project);
                });
        };

        $scope.cancelModify = function() {
            var project = $scope.projectsRaw.filter(function(e) {
                return e.name == $scope.tmpProject.name;
            })[0];
            initTmpProject(project);
        };

        $scope.cancelSelection = function() {
            $scope.childrenProject = {};
            if (!$scope.tmpProject.children) {
                return;
            }
            for (var i = 0; i < $scope.tmpProject.children.length; i++) {
                $scope.childrenProject[$scope.tmpProject.children[i]] = true;
            }
            console.log('tmpProject: %o', $scope.tmpProject);
        };

        $scope.selectChildren = function() {
            $scope.tmpProject.children = [];
            for (var i in $scope.childrenProject) {
                if (!$scope.childrenProject.hasOwnProperty(i) ||
                    !$scope.childrenProject[i]) {
                    continue;
                }
                if (i == $scope.tmpProject.name) {
                    $scope.childrenProject[i] = false;
                    continue;
                }
                $scope.tmpProject.children.push(i);
            }
            console.log('tmpProject: %o', $scope.tmpProject);
        };

        $scope.$watch(
            'filterKey',
            function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.projects = newValue ?
                    filterFilter($scope.projectsRaw, newValue) :
                    $scope.projectsRaw;
                if ($scope.projects && $scope.projects.length) {
                    $scope.projectName = $scope.projects[0].name;
                }
            }
        );

        $scope.$watch(
            'filterParentKey',
            function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.parentProjects = newValue ?
                    filterFilter($scope.projectsRaw, newValue) :
                    $scope.projectsRaw;
            }
        );

        // 用于从服务器获取到项目数据后更新显示
        $scope.$watch(
            "projects",
            function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                var cur = currentProject();
                initTmpProject(cur);
                //updateShowing(cur);
            }
        );

        // 用于跟踪选的项目变更后更新显示
        $scope.$watch(
            "projectName",
            function() {
                var cur = currentProject();
                initTmpProject(cur);
                $scope.parentReadonly = true;
                // 根据当前指定project初始化子项目选中情况
                var children = $scope.tmpProject.children;
                children = children ? children : [];
                for (var i = 0; i < children.length; i++) {
                    $scope.childrenProject[children[i]] = true;
                }
                //updateShowing(cur);
            }
        );

    }
]);

mainFrameCtrl.controller('QuerySubjectCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('QueryVoucherCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.message = '';
        $scope.msgClass = 'alert-success';
        $scope.description = '';
        // 将时间范围初始化为当年的1月1日至查询当天
        var time = new Date();
        var year = time.getFullYear();
        $scope.dateFrom = year + '-01-01';
        var month = time.getMonth() + 1;
        month = month > 9 ? month : '0' + month;
        var day = time.getDate();
        day = day > 9 ? day : '0' + day;
        $scope.dateTo = year + '-' + month + '-' + day;

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
        };

        $scope.hasVoucher = function(index) {
            var voucher = $scope.figures[index].voucher.path;
            return voucher != '' && voucher != undefined;
        };

        $scope.showVoucher = function(index) {
            if (!$scope.hasVoucher(index)) {
                return;
            }
            //var query = 'date=' + $scope.figures[index].date;
            //query += '&project=' + $scope.figures[index].project;
            //query += '&subjectId=' + $scope.figures[index].subjectId;
            //query += '&voucherId=' + $scope.figures[index].voucher.id;
            var query = 'id=' + $scope.figures[index].id;
            open('/pdfShow?' + query, 'pdfShow',
                'width=800,height=600,toolbar=0,status=0,location=0,' +
                    'scrollbars=1');
        };
    }
]);

mainFrameCtrl.controller('QueryContractCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('QueryDocumentCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('QueryKeyCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('PisTableCtrl', ['$scope', '$http', 'filterFilter',
    function($scope, $http, filterFilter) {
        $scope.grade = 4;
        $scope.showSubject = true;
        $scope.showMsg = false;
        $scope.subjectsRaw = [];
        // 将时间范围初始化为当年的1月1日至查询当天
        var time = new Date();
        var year = time.getFullYear();
        $scope.dateFrom = year + '-01-01';
        var month = time.getMonth() + 1;
        month = month > 9 ? month : '0' + month;
        var day = time.getDate();
        day = day > 9 ? day : '0' + day;
        $scope.dateTo = year + '-' + month + '-' + day;

        $http.post('/queryProject', {}).success(function (res) {
            $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
            $scope.message = res.message;
            $scope.projectsRaw = res.projects;
            $scope.projects = res.projects;
            $scope.projectName = $scope.projectsRaw[0].name;
        }).error(function (res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        $scope.queryData = function() {
            $scope.subjects = [];
            $http.post('/pisTable', {
                projectName: $scope.projectName,
                dateFrom: $scope.dateFrom,
                dateTo: $scope.dateTo,
                includeSubProject: $scope.includeSubProject
            }).success(function(res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                //console.log('msgClass: ' + $scope.msgClass);
                $scope.message = res.message;
                if (!$scope.message) {
                    $scope.message = '未知错误，请先退出后重新登录尝试';
                }
                if (!res.data) {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = '该项目没有任何财务数据';
                    return;
                }
                $scope.subjectsRaw = res.data;
                // 过滤出指定级别以上的科目
                $scope.subjects = $scope.subjectsRaw.filter(function(e) {
                    return e.id.length <= $scope.grade * 2 + 1;
                });
            }).error(function (res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };

        $scope.colorLevel = function(id) {
            var len = id.toString().length - 3;
            var color = ['info', 'success', 'warning', ''];
            return color[len / 2];
        };

        $scope.$watch(
            'msgClass',
            function(newValue) {
                $scope.showMsg = (newValue == 'alert-danger');
            }
        );

        $scope.$watch(
            'filterKey',
            function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                $scope.projects = $scope.filterKey ?
                    filterFilter($scope.projectsRaw, newValue) :
                    $scope.projectsRaw;
                if ($scope.projects && $scope.projects.length) {
                    $scope.projectName = $scope.projects[0].name;
                }
            }
        );

        $scope.$watch(
            'dateFrom',
            function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                $scope.subjects = [];
                $scope.subjectsRaw = [];
                var date = new Date(newValue);
                $scope.showSubject = (date.toString() != 'Invalid Date' &&
                    date.getFullYear() >= 2010);
                if (!$scope.showSubject) {
                    $scope.grade = 1;
                }
            }
        );

        $scope.$watch(
            'dateTo',
            function(newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                $scope.subjects = [];
                $scope.subjectsRaw = [];
            }
        );

        $scope.$watch(
            'projectName',
            function(newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                $scope.subjects = [];
                $scope.subjectsRaw = [];
            }
        );

        $scope.$watch(
            'grade',
            function(newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                $scope.subjects = $scope.subjectsRaw.filter(function(e) {
                    return e.id.toString().length <= newValue * 2 + 1;
                });
            }
        );
    }

]);

mainFrameCtrl.controller('CreateProjectCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.message = '';
        $scope.msgClass = 'alert-success';
        $scope.name = '';
        $scope.description = '';
        $scope.projectsRaw = [];
        $scope.projects = [];
        $scope.parentProject = '';
        // 用于临时保存选中项目
        $scope.childrenProject = {};
        // 当前已确认选中的项目
        $scope.childrenList = [];

        $http.post('/queryProject', {}).success(function(res) {
            $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
            $scope.message = res.message;
            $scope.projectsRaw = res.projects.sort(function(a, b) {
                return a.name < b.name ? -1 : 1;
            });
            //console.log('projects\n' + JSON.stringify($scope.projectsRaw));
            $scope.projects = $scope.projectsRaw.slice(0);
        }).error(function (res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        $scope.createProject = function() {
            console.log('description: ' + $scope.description);
            $http.post('/createProject', {
                name: $scope.name,
                id: $scope.id,
                description: $scope.description,
                parent: $scope.parentProject,
                children: $scope.childrenList,
                option: 'notArbitrary'
            }).success(function(res) {
                if (res.status == 'ok') {
                    $scope.projectsRaw.push({name: $scope.name});
                    $scope.projects.push({name: $scope.name});
                    $scope.name = '';
                    $scope.id = '';
                    $scope.description = '';
                    $scope.msgClass = 'alert-success';
                } else {
                    $scope.msgClass = 'alert-danger';
                }
                $scope.message = res.message;
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
            // 将设置清空
            $scope.parentProject = '';
            $scope.childrenProject = {};
            $scope.childrenList = [];
            $scope.parentFilterKey = '';
            $scope.childrenFilterKey = '';
        };

        $scope.cancelSelection = function() {
            $scope.childrenProject = {};
            for (var i = 0; i < $scope.childrenList.length; i++) {
                $scope.childrenProject[$scope.childrenList[i]] = true;
            }
            console.log('childrenProject: %o', $scope.childrenProject);
            console.log('childrenList: %o', $scope.childrenList);
        };

        $scope.selectChildren = function() {
            $scope.childrenList = [];
            for (var i in $scope.childrenProject) {
                if (!$scope.childrenProject.hasOwnProperty(i) ||
                    $scope.childrenProject[i] == false) {
                    continue;
                }
                if (i == $scope.parentProject) {
                    $scope.childrenProject[i] = false;
                    continue;
                }
                $scope.childrenList.push(i);
            }
            console.log('childrenProject: %o', $scope.childrenProject);
            console.log('childrenList: %o', $scope.childrenList);
        };

        $scope.$watch(
            'parentProject',
            function(newValue, oldValue) {
                if (newValue === oldValue ||
                    !$scope.childrenProject[newValue]) {
                    return;
                }
                $scope.childrenProject[newValue] = false;
                for (var i = 0; i < $scope.childrenList.length; i++) {
                    if ($scope.childrenList[i] == newValue) {
                        $scope.childrenList.splice(i, 1);
                        break;
                    }
                }
            }
        )
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
        //$scope.selectedFile = '2011';
        $scope.path = '';
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
        // 初始化$scope.projects，保存项目列表
        $http.post('/queryProject', {}).success(function(res) {
            $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
            $scope.message = res.message;
            $scope.projects = res.projects;
        }).error(function(res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });
        // 初始化$scope.files，保存文件列表
        $http.post('/queryFile', {path: $scope.path}).success(function(res) {
            $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
            $scope.message = res.message;
            $scope.fileData = res.fileData;
            console.log('file data: %o', $scope.fileData);
        }).error(function(res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        $scope.cancelSelection = function() {
            $scope.fileFilterKey = '';
            $scope.selectedFile = '';
            console.log('selected file name: %o', $scope.selectedFile);
        };

        $scope.selectFile = function() {
            $scope.fileFilterKey = '';
            console.log('selected file name: %o', $scope.selectedFile);
        };

        // 返回是否已选择批量处理模式
        $scope.batchMode = function() {
            return $scope.style == 'serverBatch' ||
                $scope.style == 'clientBatch';
        };

        $scope.buttonName = function() {
            return $scope.selectedFile ?
                $scope.selectedFile : "从系统指定的文件夹中选择文件";
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

mainFrameCtrl.controller('VoucherAutoBindCtrl', ['$scope', '$http',
    function($scope, $http) {
        // 将时间范围初始化为当年的1月1日至查询当天
        var time = new Date();
        var year = time.getFullYear();
        $scope.dateFrom = year + '-01-01';
        var month = time.getMonth() + 1;
        month = month > 9 ? month : '0' + month;
        var day = time.getDate();
        day = day > 9 ? day : '0' + day;
        $scope.dateTo = year + '-' + month + '-' + day;

        $scope.message = '';
        $scope.msgClass = 'alert-success';
        $scope.description = '';
        $scope.onlyUnbound = true;
        $scope.projectName = 'all';
        $scope.subject = 'all';
        $http.post('/queryProject', {}).success(function(res) {
            $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
            $scope.message = res.message;
            $scope.projectsRaw = res.projects;
            $scope.projects = res.projects;
        }).error(function (res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        $http.get('/subject').success(function(res) {
            $scope.subjects = res;
            $scope.subjectIds = Object.keys(res);
        }).error(function (res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        $scope.autoBind = function() {
            //console.log('startDate: ' + $scope.startDate);
            $http.post('/voucherAutoBind',{
                dateFrom: $scope.dateFrom,
                dateTo: $scope.dateTo,
                timezone: (new Date()).getTimezoneOffset(),
                project: $scope.projectName,
                subject: $scope.subject,
                onlyUnbound: $scope.onlyUnbound,
                rewriteBound: $scope.rewriteBound
            }).success(function(res) {
                $scope.msgClass = res.status == 'ok' ?
                    'alert-success' : 'alert-danger';
                $scope.message = res.message ?
                    res.message : '未知错误，请先退出后重新登录尝试';
                $scope.noVouchers = res.data.noVouchers;
                $scope.dbSaveErrs = res.data.dbSaveErrs;
                //$scope.duplicates = res.data.duplicates;
                //$scope.len1 = res.data.duplicates.length;
                $scope.len2 = res.data.noVouchers.length;
                $scope.len3 = res.data.dbSaveErrs.length;
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };

        $scope.toLocalDate = function(time) {
            return (new Date(time)).toLocaleDateString();
        }
    }
]);

mainFrameCtrl.controller('VoucherManualBindCtrl', ['$scope',
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
        // 将时间范围初始化为当年的1月1日至查询当天
        var time = new Date();
        var year = time.getFullYear();
        $scope.dateFrom = year + '-01-01';
        var month = time.getMonth() + 1;
        month = month > 9 ? month : '0' + month;
        var day = time.getDate();
        day = day > 9 ? day : '0' + day;
        $scope.dateTo = year + '-' + month + '-' + day;

        $scope.message = '';
        $scope.msgClass = 'alert-success';
        $scope.name = '';
        $scope.description = '';
        $scope.logReport = function() {
            //console.log('startDate: ' + $scope.startDate);
            $http.post('/logReport',{
                startDate: $scope.dateFrom,
                endDate: $scope.dateTo,
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
