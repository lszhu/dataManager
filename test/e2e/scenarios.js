'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Cheque System', function() {

    it('should login ok', function() {
        browser.driver.manage().window().setSize(1200, 900);
        browser.get('/login');
        $('input[name=username]').sendKeys('admin');
        $('input[name=password]').sendKeys('admin');
        $('button').click();
        browser.getLocationAbsUrl().then(function(url) {
            expect(url.split('#')[1]).toBe('/');
        });
    });

    it('should open online help', function() {
        browser.get('#/');
        $$('a[href$=guide]').get(1).click();
        expect($('.main h1').getText())
            .toBe('财务档案系统操作指南');
    });
});

describe('log query', function() {
    //beforeEach(function() {
    //    browser.get('/login');
    //    $('input[name=username]').sendKeys('admin');
    //    $('input[name=password]').sendKeys('admin');
    //    $('button').click();
    //});

    it('should open log query page', function() {
        browser.get('#/maintain/logReport');
        expect(element.all(by.repeater('log in logMsgs')).count()).toBe(0);
    });

    it('should list many log items', function() {
        browser.get('#/maintain/logReport');
        //var startDate = element(by.model('startDate'));
        //startDate.sendKeys('08-20-2014');
        //element(by.model('startDate')).sendKeys(new Date('2014-08-20'));
        //element(by.model('endDate')).sendKeys('2014-09-30');
        browser.executeScript(
            'document.getElementById("startDate").value="2014-08-15"');
        browser.executeScript(
            'document.getElementById("endDate").value="2014-08-20"');
        element(by.partialButtonText('查 询')).click();
        expect(element.all(by.repeater('log in logMsgs')).count())
            .toBeGreaterThan(10);
    });

    it('should only list log items with ok status', function() {
        browser.get('#/maintain/logReport');
        element(by.model('status')).sendKeys('成功');
        element(by.partialButtonText('查 询')).click();
        var status = null;
        status = element
            .all(by.repeater('log in logMsgs').column('{{log.status}}'))
            .filter(function(e, i) {
                return e.getText().then(function(text) {
                    return text != '成功';
                });
            });
        expect(status[0]).toBeUndefined();
    });
});

describe('after logout cheque system', function() {
    it('should redirect to login page', function() {
        $('a[href$=logout]').click();
        browser.get('#/');
        browser.getLocationAbsUrl().then(function(url) {
            expect(url).toMatch(/login#\/$/);
        });
    });
});