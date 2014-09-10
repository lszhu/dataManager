'use strict';

/* Services */

var appService = angular.module('appService', []);
appService.factory('AppMenu', function() {
    return [
        {
            name: '档案',
            subMenu: [
                {name: '库房管理', link: '#archive/storeManage'},
                {name: '库房查询', link: '#archive/storeQuery'},
                {name: '立卷归档', link: '#archive/filing '},
                {name: '电子档案管理', link: '#archive/digital'},
                {name: '关联管理', link: '#archive/bind'},
                {name: '借阅/归还', link: '#archive/borrowReturn'},
                {name: '鉴定销毁', link: '#archive/destroy'},
                {name: '档案统计', link: '#archive/report'}
            ],
            icon: 'glyphicon glyphicon-book'
        },
        {
            name: '检索',
            subMenu: [
                {name: '项目', link: '#search/queryProject'},
                {name: '科目', link: '#search/querySubject'},
                {name: '凭证', link: '#search/queryVoucher'},
                {name: '合同', link: '#search/queryContract'},
                {name: '文件', link: '#search/queryFile'},
                {name: '关键词', link: '#search/queryKey'}
            ],
            icon: 'glyphicon glyphicon-search'
        },
        {
            name: '报表',
            subMenu: [
                {name: '时段 - 科目 x 项目', link: '#report/isp'},
                {name: '项目 - 时段 - 科目', link: '#report/pis'},
                {name: '项目 - 科目 x 时间', link: '#report/pst'},
                {name: '科目 - 时间 x 项目', link: '#report/stp'}
            ],
            icon: 'glyphicon glyphicon-list-alt'
        },
        {
            name: '图表',
            subMenu: [
                {name: '时段 - 科目 x 项目', link: '#report/ispGraph'},
                {name: '项目 - 时段 - 科目', link: '#report/pisGraph'},
                {name: '项目 - 科目 x 时间', link: '#report/pstGraph'},
                {name: '科目 - 时间 x 项目', link: '#report/stpGraph'}
            ],
            icon: 'glyphicon glyphicon-signal'
        },
        {
            name: '工具',
            subMenu: [
                {name: '项目创建', link: '#tool/createProject'},
                {name: '项目合并', link: '#tool/mergeProject'},
                {name: '财务凭证数据添加', link: '#tool/addFigure'},
                {name: '财务凭证数据导入', link: '#tool/importFigure'},
                {name: '文档自动关联', link: '#tool/documentManualBind'},
                {name: '文档手动关联', link: '#documentAutoBind'},
                {name: '项目创建/合并/更新/删除', link: '#'},
                {name: '财务数据增加/修改/删除/导入', link: '#'},
                {name: '票据/合同/文件自动/手动关联', link: '#'}
            ],
            icon: 'glyphicon glyphicon-wrench'
        },
        {
            name: '高级',
            subMenu: [
                {name: '科目管理', link: '#maintain/subjectManage'},
                {name: '用户管理', link: '#maintain/'},
                {name: '用户组管', link: '#maintain/'},
                {name: '日志查看', link: '#maintain/'},
                {name: '系统状态', link: '#maintain/'}
            ],
            icon: 'glyphicon glyphicon-tower'
        }
    ]
});

///////////////////////////////////////////////////////////
// used for phoneCat, a template app

var phonecatServices = angular.module('phonecatServices', ['ngResource']);

phonecatServices.factory('Phone', ['$resource',
  function($resource){
    return $resource('phones/:phoneId.json', {}, {
      query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
    });
  }]);
