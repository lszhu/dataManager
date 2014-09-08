'use strict';

/* Services */

var appService = angular.module('appService', []);
appService.factory('AppMenu', function() {
    return [
        {
            name: '检索',
            subMenu: [
                {name: '项目', link: '/search/project'},
                {name: '科目', link: '/search/subject'},
                {name: '凭证', link: '/search/voucher'},
                {name: '合同', link: '/search/contract'},
                {name: '文件', link: '/search/file'},
                {name: '关键词', link: '/search/key'}
            ]
        },
        {
            name: '报表',
            subMenu: [
                {name: '时段-科目x项目', link: '/report/isp'},
                {name: '项目-时段-科目', link: '/report/pis'},
                {name: '项目-科目x时间', link: '/report/pst'},
                {name: '科目-时间x项目', link: '/report/stp'}
            ]
        },
        {
            name: '档案',
            subMenu: [
                {name: '库房管理', link: '/archive/storeManage'},
                {name: '库房查询', link: '/archive/storeQuery'},
                {name: '立卷归档', link: '/archive/filing '},
                {name: '电子档案管理', link: '/archive/digital'},
                {name: '关联管理', link: '/archive/bind'},
                {name: '借阅/归还', link: '/archive/borrowReturn'},
                {name: '鉴定销毁', link: '/archive/destroy'},
                {name: '档案统计', link: '/archive/report'}
            ]
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
