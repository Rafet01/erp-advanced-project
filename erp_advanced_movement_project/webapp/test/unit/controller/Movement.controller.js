/*global QUnit*/

sap.ui.define([
	"erp_advanced_movement_project/controller/Movement.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Movement Controller");

	QUnit.test("I should test the Movement controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
