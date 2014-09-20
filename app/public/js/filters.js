'use strict';

/* Filters */

//angular.module('checkSysFilters', [])
//    .filter('underGrade', function(grade) {
//        return function(inputs) {
//            return inputs.filter(function(e) {
//                return e.id.length <= newValue * 2 + 1; }
//            );
//        }
//    });
//
////////////////////
angular.module('phonecatFilters', []).filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
});
