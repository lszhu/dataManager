'use strict';

/* Services */

var appService = angular.module('appService', []);
//appService.factory('AppMenu',
//    function() {
appService.provider('AppMenu', function() {
    this.$get = function() {
        return [
            {
                name: '档案',
                subMenu: [
                    {
                        name: '库房管理',
                        link: 'archive/storeManage',
                        controller: 'StoreManageCtrl'
                    },
                    {
                        name: '库房查询',
                        link: 'archive/storeQuery',
                        controller: 'StoreQueryCtrl'
                    },
                    {
                        name: '立卷归档',
                        link: 'archive/filing',
                        controller: 'FilingCtrl'
                    },
                    {
                        name: '电子档案管理',
                        link: 'archive/digital',
                        controller: 'DigitalCtrl'
                    },
                    {
                        name: '关联管理',
                        link: 'archive/bind',
                        controller: 'BindCtrl'
                    },
                    {
                        name: '借阅/归还',
                        link: 'archive/borrowReturn',
                        controller: 'BorrowReturnCtrl'
                    },
                    {
                        name: '鉴定销毁',
                        link: 'archive/destroy',
                        controller: 'DestroyCtrl'
                    },
                    {
                        name: '档案统计',
                        link: 'archive/report',
                        controller: 'ReportCtrl'
                    }
                ],
                icon: 'glyphicon glyphicon-book'
            },
            {
                name: '检索',
                subMenu: [
                    {
                        name: '项目概要',
                        link: 'search/queryProject',
                        controller: 'ProjectCtrl'
                    },
                    {
                        name: '项目详情',
                        link: 'search/queryProjectDetail',
                        controller: 'ProjectDetailCtrl'
                    },
                    {
                        name: '科目',
                        link: 'search/querySubject',
                        controller: 'SubjectCtrl'
                    },
                    {
                        name: '凭证',
                        link: 'search/queryVoucher',
                        controller: 'VoucherCtrl'
                    },
                    {
                        name: '合同',
                        link: 'search/queryContract',
                        controller: 'ContractCtrl'
                    },
                    {
                        name: '文件',
                        link: 'search/queryFile',
                        controller: 'DocumentCtrl'
                    },
                    {
                        name: '综合查询',
                        link: 'search/queryKey',
                        controller: 'KeyCtrl'
                    }
                ],
                icon: 'glyphicon glyphicon-search'
            },
            {
                name: '报表',
                subMenu: [
                    {
                        name: '项目 - 时段 - 科目',
                        link: 'report/pis',
                        controller: 'PisCtrl'
                    },
                    {
                        name: '项目 - 科目 * 时间',
                        link: 'report/pst',
                        controller: 'PstCtrl'
                    },
                    {
                        name: '科目 - 时间 * 项目',
                        link: 'report/stp',
                        controller: 'StpCtrl'
                    },
                    {
                        name: '时段 - 科目 * 项目',
                        link: 'report/isp',
                        controller: 'IspCtrl'
                    }
                ],
                icon: 'glyphicon glyphicon-list-alt'
            },
            {
                name: '图表',
                subMenu: [
                    {
                        name: '项目 - 时段 - 科目',
                        link: 'report/pisGraph',
                        controller: ''
                    },
                    {
                        name: '项目 - 科目 * 时间',
                        link: 'report/pstGraph',
                        controller: ''
                    },
                    {
                        name: '科目 - 时间 * 项目',
                        link: 'report/stpGraph',
                        controller: ''
                    },
                    {
                        name: '时段 - 科目 * 项目',
                        link: 'report/ispGraph',
                        controller: ''
                    }
                ],
                icon: 'glyphicon glyphicon-signal'
            },
            {
                name: '工具',
                subMenu: [
                    {
                        name: '项目创建',
                        link: 'tool/createProject',
                        controller: 'CreateProjectCtrl'
                    },
                    {
                        name: '项目合并',
                        link: 'tool/mergeProject',
                        controller: 'MergeProjectCtrl'
                    },
                    {
                        name: '财务凭证数据添加',
                        link: 'tool/addFigure',
                        controller: 'AddFigureCtrl'
                    },
                    {
                        name: '财务凭证数据导入',
                        link: 'tool/importFigure',
                        controller: 'ImportFigureCtrl'
                    },
                    {
                        name: '文档自动关联',
                        link: 'tool/documentAutoBind',
                        controller: 'DocumentAutoBindCtrl'
                    },
                    {
                        name: '文档手动关联',
                        link: 'documentManualBind',
                        controller: 'DocumentManualBindCtrl'
                    },
                    {
                        name: '项目创建/合并/更新/删除',
                        link: '',
                        controller: ''
                    },
                    {
                        name: '财务数据增加/修改/删除/导入',
                        link: '',
                        controller: ''
                    },
                    {
                        name: '票据/合同/文件自动/手动关联',
                        link: '',
                        controller: ''
                    }
                ],
                icon: 'glyphicon glyphicon-wrench'
            },
            {
                name: '高级',
                subMenu: [
                    {
                        name: '科目管理',
                        link: 'maintain/subjectManage',
                        controller: 'subjectManageCtrl'
                    },
                    {
                        name: '用户管理',
                        link: 'maintain/userManage',
                        controller: 'userManageCtrl'
                    },
                    {
                        name: '用户组管',
                        link: 'maintain/groupManage',
                        controller: 'groupManageCtrl'
                    },
                    {
                        name: '日志查看',
                        link: 'maintain/logReport',
                        controller: 'logReportCtrl'
                    },
                    {
                        name: '系统状态',
                        link: 'maintain/systemStatus',
                        controller: 'systemStatusCtrl'
                    }
                ],
                icon: 'glyphicon glyphicon-tower'
            }
        ]
    }
});

///////////////////////////////////////////////////////////
// used for phoneCat, a template app

var phonecatServices = angular.module('phonecatServices',
    ['ngResource']);

phonecatServices.factory('Phone',
    ['$resource',
        function($resource){
            return $resource('phones/:phoneId.json',
                {}, {
                    query: {method:'GET',
                        params:{phoneId:'phones',
                            controller: ''
                        }, isArray:true}
                });
        }]);
