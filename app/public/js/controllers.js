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
        $scope.gotoPageHash = function (hash) {
            location.hash = hash;
            console.log('hash: ' + hash);
            };
    }
]);

mainFrameCtrl.controller('RegisterCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.serverId = '';
        $scope.customerId = '';

        $scope.saveCustomerId = function() {
            $http.post('/saveCustomerId', {customerId: $scope.customerId})
                .success(function(res) {
                    $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                    $scope.message = res.message;
                }).error(function(err) {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = '保存失败: ' + JSON.stringify(err);
                });
        };

        $scope.reset = getSerial;

        getSerial();

        function getSerial() {
            $http.get('/getSerial')
                .success(function(res) {
                    $scope.serverId = res.serverId;
                    $scope.customerId = res.customerId;
                    $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                    $scope.message = res.message;
                }).error(function(err) {
                    console.log('未知外界原因，无法获取系统注册信息，%o', err);
                    $scope.msgClass =
                        res.status == 'alert-danger';
                    $scope.message =
                        '无法获取系统注册信息: ' + JSON.stringify(err);
                });
        }
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

mainFrameCtrl.controller('DigitalArchiveCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('ArchiveBindCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('BorrowReturnCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('DestroyCtrl', ['$scope',
    function($scope) {
        $scope.operation = 'add';
    }
]);

mainFrameCtrl.controller('ReportCtrl', ['$scope',
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

        $scope.gotoProjectDetail = function(name) {
            $location.path('/search/queryProjectDetail')
                .search('project', name);
        };

        $scope.queryProject = queryProject;

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
                    } else if (res.status == 'rightsErr') {
                        alert(res.message);
                    } else if (res.status != 'ok') {
                        alert('系统原因导致未能修改成功：\n' + res.message);
                        //project.name = $scope.oldName;
                        //project.description = $scope.oldDescription;
                    } else {
                        queryProject();
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

        function queryProject() {
            //$scope.line = -1;
            $http.post('/queryProject', {
                name: $scope.name,
                id: $scope.id,
                description: $scope.description
            }).success(function(res) {
                $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope.projects = res.projects.sort(function(a, b) {
                    if (a.name < b.name) {
                        return -1;
                    } else if (a.name > b.name) {
                        return 1;
                    }
                    return 0;
                });
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        }
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
                        alert('未能成功修改：\n' + res.message);
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

        function queryProject() {
            $http.post('/queryProject', {}).success(function (res) {
                $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope.projectsRaw = res.projects.sort(function(a, b) {
                    if (a.name < b.name) {
                        return -1;
                    } else if (a.name > b.name) {
                        return 1;
                    }
                    return 0;
                });
                $scope.projects = $scope.projectsRaw;
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
        }
    }
]);

mainFrameCtrl.controller('QuerySubjectCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('QueryVoucherCtrl', ['$scope', '$http', '$timeout',
    '$window', function($scope, $http, $timeout, $window) {
        // 每页显示的最大条目数
        var limit = 100;
        // 页码列表长度
        var navPageBar = 5;
        // 总页码数
        var pages = 0;
        var curPage = 1;
        // 存放从服务器查询到的最初数据并按由新到旧进行排序
        var voucherListRaw = [];
        // 当前页码表
        $scope.pageList = [];
        // 当前页面条目计数起始数目
        $scope.baseNumber = 1;

        // 用于指示数据删除前是否核准
        $scope.confirmed = false;
        $scope.condition = {};
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
            $scope.condition = {
                dateFrom: $scope.dateFrom,
                dateTo: $scope.dateTo,
                timezone: (new Date()).getTimezoneOffset(),
                amountFrom: $scope.amountFrom,
                amountTo: $scope.amountTo,
                voucherId: $scope.voucherId,
                project: $scope.project,
                subjectName: $scope.subjectName,
                description: $scope.description
            };
            $http.post('/queryVoucher', $scope.condition)
                .success(function(res) {
                    $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                    $scope.message = res.message;
                    $scope.figures = res.figures
                        .sort(function(a, b) {
                            if (a.date < b.date) {
                                return -1;
                            } else if (a.data = b.data) {
                                return 0;
                            } else {
                                return 1;
                            }
                        });
                    voucherListRaw = $scope.figures;
                    initPage();
                    $scope.setPage(1);
                }).error(function(res) {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = 'system error: ' + JSON.stringify(res);
                });
        };

        $scope.checkVoucher = function() {
            $scope.confirmed = false;
            $scope.queryVoucher();
            $timeout(function() {$scope.confirmed = true;}, 3000);
        };

        $scope.removeVoucher = function() {
            if (!confirm('你确认要删除这些凭证数据吗？')) {
                return;
            }
            $http.post('/deleteVoucher', $scope.condition)
                .success(function(res) {
                    if (res.status == 'ok') {
                        $scope.queryVoucher();
                        return;
                    }
                    $scope.msgClass = 'alert-danger';
                    $scope.message = res.message;
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

        $scope.hasVoucher = function(figure) {
            if (!figure || !figure.voucher || !figure.voucher.path) {
                return;
            }
            var voucher = figure.voucher.path;
            return voucher != '' && voucher != undefined;
        };

        $scope.showVoucher = function(figure) {
            if (!figure || !figure.voucher || !figure.voucher.path) {
                return;
            }
            //var query = 'id=' + $scope.figures[index].id;
            //open('/pdfShow?' + query, 'pdfShow',
            //    'width=800,height=600,toolbar=0,status=0,location=0,' +
            //        'scrollbars=1');
            var query = 'file=' + figure.voucher.path;
            open('/pdfViewer/web/viewer.html?' + query, 'pdfShow',
                'width=800,height=600,toolbar=0,status=0,location=0,' +
                'scrollbars=1');
        };


        $scope.setPage = function(n) {
            $scope.baseNumber = (n - 1) * limit + 1;
            curPage = n;
            $scope.voucherList = voucherListRaw.slice(limit * (n - 1), limit * n);
            $window.scrollTo(0, 0);
        };

        $scope.nextPageList = function() {
            var end = $scope.pageList.slice(-1);
            var i;
            var len = $scope.pageList.length;
            if (end < pages - navPageBar) {
                for (i = 0; i < len; i++) {
                    $scope.pageList[i] += navPageBar;
                }
                $scope.setPage($scope.pageList[0]);
            } else {
                for (i = 0; i < len; i++) {
                    $scope.pageList[i] = pages - len + 1 + i;
                }
                if ($scope.pageList
                        .every(function(e) {return e != curPage;})) {
                    $scope.setPage($scope.pageList[0]);
                }
            }
        };

        $scope.previousPageList = function() {
            var first = $scope.pageList[0];
            var i;
            var len = $scope.pageList.length;
            if (first - navPageBar > 0) {
                for (i = 0; i < len; i++) {
                    $scope.pageList[i] -= navPageBar;
                }
                $scope.setPage($scope.pageList[0]);
            } else {
                for (i = 0; i < len; i++) {
                    $scope.pageList[i] = i + 1;
                }
                if ($scope.pageList
                        .every(function(e) {return e != curPage;})) {
                    $scope.setPage($scope.pageList[0]);
                }
            }
        };

        $scope.setActive = function(n) {
            return curPage == n ? 'active' : '';
        };

        function initPage() {
            $scope.pageList = [];
            $scope.voucherList = voucherListRaw.slice(0, limit);
            pages = Math.ceil(voucherListRaw.length / limit);
            for (var i = 1; i <= pages && i <= navPageBar; i++) {
                $scope.pageList[i - 1] = i;
            }
        }
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

        $scope.queryData = function(option) {
            if (option == 'total') {
                $scope.projectName = '';
                //console.log('project name: ' + $scope.projectName);
            }
            $scope.subjects = [];
            $http.post('/pisTable', {
                projectName: $scope.projectName,
                dateFrom: $scope.dateFrom,
                dateTo: $scope.dateTo,
                timezone: (new Date()).getTimezoneOffset(),
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

mainFrameCtrl.controller('ProjectTableCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.subject = 'all';
        initPeriod();
        initSubject();

        $scope.queryData = function() {
            console.log('subjectId: ' + $scope.subject);
            $scope.data = [];
            $http.post('/projectTable', {
                subject: $scope.subject,
                dateFrom: $scope.dateFrom,
                dateTo: $scope.dateTo,
                timezone: (new Date()).getTimezoneOffset()
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
                    $scope.message = '没有任何财务数据';
                    return;
                }
                $scope.projects = res.data;
            }).error(function (res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };

        $scope.$watch(
            'subject',
            function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.projects = [];
            }
        );

        // 将时间范围初始化为当年的1月1日至查询当天
        function initPeriod() {
            var time = new Date();
            var year = time.getFullYear();
            $scope.dateFrom = year + '-01-01';
            var month = time.getMonth() + 1;
            month = month > 9 ? month : '0' + month;
            var day = time.getDate();
            day = day > 9 ? day : '0' + day;
            $scope.dateTo = year + '-' + month + '-' + day;
        }

        // 由服务器获取科目信息并初始化控制器地变量
        function initSubject() {
            $http.get('/subject').success(function(res) {
                if (res.status == 'ok') {
                    $scope.msgClass = 'alert-success';
                    $scope.subjects = res.subject;
                    $scope.subjectIds = Object.keys(res.subject);
                } else {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = res.message;
                }
            }).error(function (res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        }

    }
]);

mainFrameCtrl.controller('ProjectGradingTableCtrl', ['$scope', '$http',
    'filterFilter', function($scope, $http, filterFilter) {
        // 设定默认年度
        $scope.yearFrom = (new Date()).getFullYear();
        $scope.yearTo = $scope.yearFrom;
        // 初始化年份数据，从1990年开始至当前
        $scope.years = [];
        for (var i = $scope.yearFrom; i >= 1990; i--) {
            $scope.years.push(i);
        }
        $scope.subject = 'all';
        $scope.granularity = 'year';
        getProject();
        getSubject();

        $scope.queryData = function(option) {
            if (option == 'all') {
                $scope.projectName = '';
            }
            $scope.showMsg = false;
            console.log('subjectId: ' + $scope.subject);
            console.log('includeSubProject: ' + $scope.includeSubProject);
            $scope.data = [];
            $http.post('/gradingTable', {
                project: $scope.projectName,
                subject: $scope.subject,
                yearFrom: $scope.yearFrom,
                yearTo: $scope.yearTo,
                timezone: (new Date()).getTimezoneOffset(),
                granularity: $scope.granularity,
                includeSubProject: $scope.includeSubProject
            }).success(function(res) {
                console.log('res: %o', res);
                $scope.message = res.message;
                if (!res.data) {
                    $scope.msgClass = 'alert-success';
                    $scope.message = '没有任何财务数据';
                    $scope.showMsg = true;
                } else if (res.status != 'ok') {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = res.message ?
                        res.message : '未知错误，请先退出后重新登录尝试';
                    $scope.showMsg = true;
                }
                $scope.grading = res.data;
            }).error(function (res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
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

        $scope.$watchCollection(
            'projectName',
            function(newValue, oldValue) {
                if (newValue != oldValue) {
                    $scope.grading = [];
                }
            }
        );
        $scope.$watchCollection(
            'subject',
            function(newValue, oldValue) {
                if (newValue != oldValue) {
                    $scope.grading = [];
                }
            }
        );

        function getProject() {
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
        }

        // 由服务器获取科目信息并初始化控制器地变量
        function getSubject() {
            $http.get('/subject').success(function(res) {
                if (res.status == 'ok') {
                    $scope.msgClass = 'alert-success';
                    $scope.subjects = res.subject;
                    $scope.subjectIds = Object.keys(res.subject);
                } else {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = res.message;
                }
            }).error(function (res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        }
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
    'filterFilter', function($scope, $http, filterFilter) {
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
        $scope.year = '';
        $scope.projectName = '';
        // 默认导入方式为服务器端本地模式
        $scope.style = 'server';
        // 初始化$scope.projects，保存项目列表
        $http.post('/queryProject', {}).success(function(res) {
            $scope.msgClass =
                    res.status == 'ok' ? 'alert-success' : 'alert-danger';
            $scope.message = res.message;
            $scope.projectsRaw = res.projects.sort(function(a, b) {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
            $scope.projects = $scope.projectsRaw;
            //$scope.projectName = res.projects ? res.projects[0].name : '';
        }).error(function(res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        $scope.openDir = function(path) {
            if (path == '..') {
                $scope.path = $scope.path.split('/').slice(0, -1).join('/');
                path = '';
            }
            $scope.path = path ? $scope.path + '/' + path : $scope.path;
            $http.post('/queryFile', {path: $scope.path}).success(function(res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope.fileData = res.fileData;
                if (!path) {
                    $scope.dataBackup = $scope.fileData;
                }
                console.log('file data: %o', $scope.fileData);
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };

        // 初始化$scope.files，保存文件列表
        $scope.openDir();

        $scope.cancelSelection = function() {
            $scope.fileFilterKey = '';
            $scope.selectedFile = '';
            $scope.path = '';
            $scope.fileData = $scope.dataBackup;
            console.log('selected file name: %o', $scope.selectedFile);
        };

        $scope.selectFile = function() {
            $scope.fileFilterKey = '';
            //$scope.fileData = $scope.dataBackup;
            console.log('selected file name: %o', $scope.selectedFile);
            console.log('selected file name: %o', $scope.path);
            // 从目录获取年份信息（如果是/或其他字符加4位数字）
            var year = $scope.path.slice(1);
            if (year > 0) {
                $scope.year = year;
            }
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
                path: $scope.path + '/' + $scope.selectedFile,
                projectName: $scope.projectName,
                year: $scope.year
            }).success(function(res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                if (res.status == 'nameErr' || res.status == 'rightsErr') {
                    return;
                }

                if (res.errLines) {
                    $scope.errLines += ' #文件名: ' + res.filename + ', ' +
                        '错误位置: ' + JSON.stringify(res.errLines);
                    return;
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
            $scope.projectsRaw = res.projects.sort(function(a, b) {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
            $scope.projects = $scope.projectsRaw;
        }).error(function (res) {
            $scope.msgClass = 'alert-danger';
            $scope.message = 'system error: ' + JSON.stringify(res);
        });

        $http.get('/subject').success(function(res) {
            if (res.status == 'ok') {
                $scope.msgClass = 'alert-success';
                $scope.subjects = res.subject;
                $scope.subjectIds = Object.keys(res.subject);
            } else {
                $scope.msgClass = 'alert-danger';
                $scope.message = res.message;
            }
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

mainFrameCtrl.controller('userManageCtrl', ['$scope', '$http',
    function($scope, $http) {
        // 用于测试的伪造账号
        //$scope.accounts = [
        //    {username: 'aaa', description: 'aaaaaa', enabled: true},
        //    {username: 'bbb', description: '', enabled: true, rights: 'readonly'},
        //    {username: 'ccc', description: '', enabled: false},
        //    {username: 'ddd', description: 'dddddd', enabled: true},
        //    {username: 'eee', description: '', enabled: true, rights: 'readonly'},
        //    {username: 'fff', description: '', enabled: false}
        //];

        fetchUser();
        $scope.enabled = true;
        $scope.rights = 'readWrite';

        $scope.loadUser = function(name) {
            $scope.password = '';
            $scope.retryPassword = '';
            name = name ? name : '';
            var user = $scope.accounts
                .filter(function(e) {return e.username == name;})[0];
            if (!user) {
                $scope.originalName = '';
                $scope.name = '';
                $scope.enabled = true;
                $scope.rights = 'readWrite';
                $scope.description = '';
                return;
            }
            console.log('user data: %o', user);
            $scope.originalName = user.username;
            $scope.name = user.username;
            $scope.enabled = user.enabled;
            $scope.rights = user.rights;
            $scope.description = user.description;
        };

        $scope.deleteUser = function(name) {
            $scope.message = '';
            if (!name) {
                return;
            }
            if (!confirm('确认要删除该用户？')) {
                return;
            }
            console.log('account name: ' + name);
            $http.post('/deleteAccount', {username: name})
                .success(function(res) {
                    if (res.status == 'ok') {
                        $scope.msgClass = 'alert-success';
                        $scope.accounts = $scope.accounts
                            .filter(function(e) {return e.username != name;});
                    } else {
                        $scope.msgClass = 'alert-danger';
                        $scope.message = res.message ?
                            res.message : '未知错误，请先退出后重新登录尝试';
                    }
                }).error(function(res) {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = 'system error: ' + JSON.stringify(res);
                });
        };

        $scope.modifyUser = function() {
            $scope.message = '';
            if (!$scope.name || !$scope.name.trim()) {
                alert('用户名不能为空');
                return;
            }
            if ($scope.password != $scope.retryPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            var data = {username: $scope.name.trim(), enabled: $scope.enabled};
                data.originalName =
                    $scope.originalName ? $scope.originalName : data.username;
            if ($scope.rights) {
                data.rights = $scope.rights;
            }
            if ($scope.description) {
                data.description = $scope.description;
            }
            if ($scope.password && $scope.password.trim()) {
                data.password = $scope.password.trim();
            }
            console.log('upload data: %o', data);
            $http.post('/modifyAccount', data)
                .success(function(res) {
                    if (res.status == 'ok') {
                        fetchUser();
                        $scope.msgClass = 'alert-success';
                    } else {
                        $scope.msgClass = 'alert-danger';
                        $scope.message = res.message ?
                            res.message : '未知错误，请先退出后重新登录尝试';
                    }
                }).error(function(res) {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = 'system error: ' + JSON.stringify(res);
                });
        };

        function fetchUser() {
            $http.get('/getAccount')
                .success(function(res) {
                    if (res.status == 'ok') {
                        $scope.accounts = res.accounts ? res.accounts : [];
                        $scope.msgClass = 'alert-success';
                        $scope.message = res.message;
                    } else {
                        $scope.msgClass = 'alert-danger';
                        $scope.message = res.message ?
                            res.message : '未知错误，请先退出后重新登录尝试';
                    }
                }).error(function(res) {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = 'system error: ' + JSON.stringify(res);
                });
        }
    }
]);

mainFrameCtrl.controller('groupManageCtrl', ['$scope',
    function($scope) {
        $scope.tmp = '';
    }
]);

mainFrameCtrl.controller('logReportCtrl', ['$scope', '$http', '$window',
    function($scope, $http, $window) {
        // 每页显示的最大条目数
        var limit = 100;
        // 页码列表长度
        var navPageBar = 5;
        // 总页码数
        var pages = 0;
        var curPage = 1;
        // 存放从服务器查询到的最初数据并按由新到旧进行排序
        var logMsgRaw = [];
        // 将时间范围初始化为查询当天之前一个月内
        var time = new Date();
        var year = time.getFullYear();
        //$scope.dateFrom = year + '-01-01';
        var month = time.getMonth() + 1;
        month = month > 9 ? month : '0' + month;
        var day = time.getDate();
        day = day > 9 ? day : '0' + day;
        $scope.dateTo = year + '-' + month + '-' + day;
        if (month == '01') {
            month = 12;
            year--;
        } else if (month < 11) {
            month = '0' + (month - 1);
        } else {
            month--;
        }
        $scope.dateFrom = year + '-' + month + '-' + day;
        console.log('dateFrom: ' + $scope.dateFrom);

        // 当前页码表
        $scope.pageList = [];
        // 当前页面条目计数起始数目
        $scope.baseNumber = 1;
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
                logMsgRaw = res.logs ? res.logs : [];
                logMsgRaw.sort(function(a, b) {
                    var delta = Date.parse(a.time) - Date.parse(b.time);
                    //console.log(delta);
                    if (delta < 0) {
                        return 1;
                    } else if (delta == 0) {
                        return 0;
                    } else {
                        return -1;
                    }
                });
                initPage();
                $scope.setPage(1);
            }).error(function(res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };

        $scope.setPage = function(n) {
            $scope.baseNumber = (n - 1) * limit + 1;
            curPage = n;
            $scope.logMsgs = logMsgRaw.slice(limit * (n - 1), limit * n);
            $window.scrollTo(0, 0);
        };

        $scope.nextPageList = function() {
            var end = $scope.pageList.slice(-1);
            var i;
            var len = $scope.pageList.length;
            if (end < pages - navPageBar) {
                for (i = 0; i < len; i++) {
                    $scope.pageList[i] += navPageBar;
                }
                $scope.setPage($scope.pageList[0]);
            } else {
                for (i = 0; i < len; i++) {
                    $scope.pageList[i] = pages - len + 1 + i;
                }
                if ($scope.pageList
                        .every(function(e) {return e != curPage;})) {
                    $scope.setPage($scope.pageList[0]);
                }
            }
        };

        $scope.previousPageList = function() {
            var first = $scope.pageList[0];
            var i;
            var len = $scope.pageList.length;
            if (first - navPageBar > 0) {
                for (i = 0; i < len; i++) {
                    $scope.pageList[i] -= navPageBar;
                }
                $scope.setPage($scope.pageList[0]);
            } else {
                for (i = 0; i < len; i++) {
                    $scope.pageList[i] = i + 1;
                }
                if ($scope.pageList
                        .every(function(e) {return e != curPage;})) {
                    $scope.setPage($scope.pageList[0]);
                }
            }
        };

        $scope.setActive = function(n) {
            if (curPage == n) {
                return 'active';
            }
        };

        $scope.toLocalTime = function(time) {
            return (new Date(time)).toLocaleString();
        };

        function initPage() {
            $scope.pageList = [];
            $scope.logMsgs = logMsgRaw.slice(0, limit);
            pages = Math.ceil(logMsgRaw.length / limit);
            for (var i = 1; i <= pages && i <= navPageBar; i++) {
                $scope.pageList[i - 1] = i;
            }
        }
    }
]);

mainFrameCtrl.controller('systemStatusCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.projects = [];
        $scope.consistence = '正常';
        $scope.figureNum = 32353;
        $scope.carryOverNum = 231;
        $scope.boundFileNum = 12342;
        $scope.logNum = 63421;
        $scope.logOk = 23523;
        $scope.login = 1233;
        $scope.loginErr = 328;

        var counter = function(parameter, collect, condition, regExp) {
            $http.post('/counter', {
                collect: collect,
                regExp: regExp,
                condition: condition
            }).success(function(res) {
                $scope.msgClass = res.status == 'ok' ?
                    'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope[parameter] = res.count;
            }).error(function (res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            })
        };

        counter('figureNum', 'figure', {});
        counter('carryOverNum', 'figure', {'voucher.id': '10000'});
        counter('boundFileNum', 'figure', {}, {'voucher.path': '.+'});
        counter('logNum', 'log', {});
        counter('logOk', 'log', {status: '成功'});
        counter('login', 'log', {operation: '登录操作'});
        counter('loginErr', 'log', {operation: '登录操作', status: '失败'});

        var checkProject = function(projects) {
            if (!projects) {
                return [];
            }
            var errs = [];
            var index, name, parent, children, tmp;
            for (var i = 0; i < projects.length; i++) {
                tmp = [];
                // 处理父项目一致性
                name = projects[i].name;
                parent = projects[i].parent;
                if (name == parent) {
                    tmp.push(name + ' --> 父项目被设置为他自己');
                }
                if (parent) {
                    index = getIndexFromName(parent, projects);
                    if (index < 0) {
                        tmp.push(name + '--> 被指定了父项目"' +
                            parent + '"，但系统中不存在项目：' + parent);
                    } else {
                        children = projects[index].children;
                        children = children ? children : [];
                        if (searchValue(name, children) < 0) {
                            tmp.push(name + ' --> 被指定了父项目"' +
                                parent + '"，但系统中项目"' + parent +
                                '"并未包含子项目：' + name);
                        }
                    }
                }
                // 处理子项目一致性
                children = projects[i].children;
                children = children ? children : [];
                if (searchValue(name, children) != -1) {
                    tmp.push(name + ' --> 被设置为其本身的子项目');
                }
                if (children && children.length) {
                    for (var j = 0; j < children.length; j++) {
                        index = getIndexFromName(children[j], projects);
                        if (index < 0) {
                            tmp.push(name + ' --> 指定了子项目"' +
                                children[j] + '"，但系统中并不存在项目：' +
                                children[j]);
                        } else {
                            if (projects[index].parent != name) {
                                tmp.push(name + ' --> 指定了子项目"' +
                                    children[j] + '"，但项目"' + children[j] +
                                    '"没有设定父项目为：' + name);
                            }
                        }
                    }
                }
                if (tmp.length) {
                    errs.push(tmp);
                }
            }
            return errs;
            function getIndexFromName(name, list) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].name == name) {
                        return i;
                    }
                }
                return -1;
            }
            function searchValue(value, list) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == value) {
                        return i;
                    }
                }
                return -1;
            }
        };

        var queryProject = function() {
            $http.post('/queryProject', {}).success(function (res) {
                $scope.msgClass =
                        res.status == 'ok' ? 'alert-success' : 'alert-danger';
                $scope.message = res.message;
                $scope.projects = res.projects;
                $scope.projectsErr = checkProject($scope.projects);
                //console.log('projects: %o', $scope.projects);
                console.log('projectsErr: %o', $scope.projectsErr);
            }).error(function (res) {
                $scope.msgClass = 'alert-danger';
                $scope.message = 'system error: ' + JSON.stringify(res);
            });
        };
        queryProject();

        // 函数checkProject()的测试用例
        //$scope.projects = [
        //    {name: 'aaa', parent: 'aaa', children: ['aaa', 'bbb', 'ccc']},
        //    {name: 'bbb', parent: 'aaaa'},
        //    {name: 'ccc', parent: 'aaa'},
        //    {name: 'ddd', parent: 'bbb', children: ['eee']},
        //    {name: 'eee', parent: 'ddd', children: ['fff', 'ggg']},
        //    {name: 'fff', parent: 'eee', children: ['ggg', 'hhh', 'zzz']},
        //    {name: 'ggg', parent: 'eee'},
        //    {name: 'hhh'}
        //];
        //$scope.projectsErr = checkProject($scope.projects);
        //console.log('projectsErr: %o', $scope.projectsErr);
    }
]);
