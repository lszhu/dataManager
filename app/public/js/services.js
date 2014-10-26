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
                        name: '档案室管理',
                        link: 'archive/storageManage',
                        controller: 'StorageManageCtrl'
                    },
                    {
                        name: '档案柜管理',
                        link: 'archive/cabinetManage',
                        controller: 'CabinetManageCtrl'
                    },
                    {
                        name: '卷宗管理',
                        link: 'archive/foldManage',
                        controller: 'FoldManageCtrl'
                    },
                    {
                        name: '库房查询',
                        link: 'archive/queryStore',
                        controller: 'QueryStoreCtrl'
                    },
                    {
                        name: '立卷归档',
                        link: 'archive/filing',
                        controller: 'FilingCtrl'
                    },
                    {
                        name: '电子档案管理',
                        link: 'archive/digitalArchive',
                        controller: 'DigitalArchiveCtrl'
                    },
                    {
                        name: '档案关联管理',
                        link: 'archive/bind',
                        controller: 'ArchiveBindCtrl'
                    },
                    {
                        name: '借阅 / 归还',
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
                        controller: 'QueryProjectCtrl'
                    },
                    {
                        name: '项目详情',
                        link: 'search/queryProjectDetail',
                        controller: 'ProjectDetailCtrl'
                    },
                    {
                        name: '科目概要',
                        link: 'search/querySubject',
                        controller: 'QuerySubjectCtrl'
                    },
                    {
                        name: '凭证查询',
                        link: 'search/queryVoucher',
                        controller: 'QueryVoucherCtrl'
                    },
                    {
                        name: '合同查询',
                        link: 'search/queryContract',
                        controller: 'QueryContractCtrl'
                    },
                    {
                        name: '文件查询',
                        link: 'search/queryFile',
                        controller: 'QueryDocumentCtrl'
                    },
                    {
                        name: '综合查询',
                        link: 'search/queryKey',
                        controller: 'QueryKeyCtrl'
                    }
                ],
                icon: 'glyphicon glyphicon-search'
            },
            {
                name: '报表',
                subMenu: [
                    {
                        name: '特定项目分科目汇总', //'项目(p) - 时段(i) - 科目(s)',
                        link: 'report/pisTable',
                        controller: 'PisTableCtrl'
                    },
                    {
                        name: '分科目汇总', //'时段 - 科目',
                        link: 'report/subjectTable',
                        controller: 'PisTableCtrl'
                    },
                    {
                        name: '按项目逐一汇总', //'时段 - 项目 *',
                        link: 'report/projectTable',
                        controller: 'ProjectTableCtrl'
                    },
                    {
                        name: '特定项目分阶段汇总', //'项目 - 时段 *',
                        link: 'report/projectGradingTable',
                        controller: 'ProjectGradingTableCtrl'
                    },
                    {
                        name: '分阶段汇总', //'时段 *',
                        link: 'report/gradingTable',
                        controller: 'ProjectGradingTableCtrl'
                    }
                ],
                icon: 'glyphicon glyphicon-list-alt'
            },
            {
                name: '图表',
                subMenu: [/*
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
                    }*/
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
                        name: '财务凭证自动关联',
                        link: 'tool/voucherAutoBind',
                        controller: 'VoucherAutoBindCtrl'
                    },
                    {
                        name: '财务凭证手动关联',
                        link: 'tool/voucherManualBind',
                        controller: 'VoucherManualBindCtrl'
                    },
                    {
                        name: '项目文档自动关联',
                        link: 'tool/documentAutoBind',
                        controller: 'DocumentAutoBindCtrl'
                    },
                    {
                        name: '项目文档手动关联',
                        link: 'tool/documentManualBind',
                        controller: 'DocumentManualBindCtrl'
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