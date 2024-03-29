angular.module('starter.controllers', ['ionic'])

.controller('receiptCtrl', function ($scope, $localstorage, $filter, $ionicActionSheet, $state, $ionicPopup, $ionicModal, $timeout, $stateParams) {
	$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
	$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
	$scope.currencies = $localstorage.getObjects('currencies');
	$scope.form = {};
	$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
	$scope.form.currency = $localstorage.getObjects('lastCurrency');
	$scope.form.kindOfPayment = ""
		$scope.form.receiptKind = "";
	$scope.form.amount = "0.00";
	if ($stateParams.guid != "new") {
		$scope.form = $localstorage.getObject('receipts', $stateParams.guid);
		$scope.receiptTitle = "Beleg Bearbeiten";
	} else {
		$scope.receiptTitle = "Neuer Beleg";
	}
	$scope.changeit = function (val) {
		val = val.toString();
		var period = val.indexOf(".");
		if (period > -1) {
			val = val.substring(0, period) + val.substring(period + 1)
		}
		var len = val.length;
		while (len < 3) {
			val = "0" + val;
			len = val.length;
		}
		val = val.substring(0, len - 2) + "." + val.substring(len - 2, len);
		while (val.length > 4 && (val[0] == 0 || isNaN(val[0]))) {
			val = val.substring(1)
		}
		if (val[0] == ".") {
			val = "0" + val
		}
		$scope.form.amount = val;
	};
	$scope.generateGUID = function () {
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		return guid;
	};
	$scope.textRequiredError = function () {
		$ionicPopup.alert({
			title : '<b>Bezeichnung:</b>',
			content : "Dieses Feld ist ein Pflichfeld"
		});
	};
	$scope.isEdit = function () {
		if ($stateParams.guid != "new") {
			return true;
		}
	};
	$scope.saveCopyReceipt = function () {
		theReceiptCopy = {
			text : $scope.form.text,
			amount : $scope.form.amount,
			date : $scope.form.date,
			receiptKind : $scope.form.receiptKind,
			kindOfPayment : $scope.form.kindOfPayment,
			currency : $scope.form.currency,
			timestamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
			guid : $scope.generateGUID()
		};
		theReceiptCopy.guid = $stateParams.guid;
		$localstorage.updateObject('receipts', theReceiptCopy);
		theReceiptCopy.guid = $scope.generateGUID();
		$localstorage.insertObject('receipts', theReceiptCopy);
	};
	$scope.hideData = {};
	$scope.setHideAlert = function () {
		$localstorage.setObject('hideAlert', {
			hideAlert : true
		});
	};
	$scope.showActionsheet = function () {
		$ionicActionSheet.show({
			titleText : 'Belegoptionen:',
			buttons : [{
					text : '<i class="icon ion-ios7-copy-outline"></i> Kopieren'
				},
			],
			destructiveText : 'L&ouml;schen',
			cancelText : 'Abbrechen',
			scope : $scope,
			buttonClicked : function (index) {
				if (index == 0) {
					if (!$scope.form.text || !$scope.form.amount || !$scope.form.date
						 || !$scope.form.receiptKind || !$scope.form.kindOfPayment || !$scope.form.currency) {
						$ionicPopup.alert({
							title : '<b>Fehler:</b>',
							content : 'Der Beleg konnte nicht kopiert werden, da nicht alle Felder ausgef&uuml;llt sind.'
						});
						return true;
					} else {
						if($localstorage.getObjects('hideAlert').hideAlert == true) {
							$scope.saveCopyReceipt();
							return true;
						} else {
							var confirmPopup = $ionicPopup.show({
								title : '<b>Beleg kopieren:</b>',
								template : 'Der Beleg wird gespeichert und kopiert! Wollen Sie diese Aktion durchf&uuml;hren?<br><input type="checkbox" ng-model="hideData.hideAlert"><font size="2"> Diese Meldung nicht mehr anzeigen.</font>',
								scope : $scope,
								buttons : [{
										text : 'Abbrechen',
										onTap : function (e) {
											return 1;
										}
									}, {
										text : '<b>OK</b>',
										type : 'button-positive',
										onTap : function (e) {
											if (typeof $scope.hideData.hideAlert === "undefined") {
												return 2;
											} else {
												return 3;
											}
										}
									},
								]
							});
						confirmPopup.then(function (res) {
							if (res == 1) {
								return true;
							}
							if (res == 3) {
								$scope.setHideAlert();
							}
							$scope.saveCopyReceipt();
						})
						return true;
					}
				}
				}
			},
			destructiveButtonClicked : function () {
				console.log($scope.form.guid);
				$localstorage.removeObject('receipts', $scope.form.guid);
				$scope.$viewHistory.backView.go();
			}
		});
	};
	$scope.saveReceipt = function () {
		var errorMessage = "";
		if (!$scope.form.text) {}
		if (!$scope.form.amount) {
			errorMessage = errorMessage + "" + "Betrag<br>";
		}
		if (!$scope.form.date) {
			errorMessage = errorMessage + "" + "Datum<br>";
		}
		if (!$scope.form.receiptKind) {
			errorMessage = errorMessage + "" + "Belegart<br>";
		}
		if (!$scope.form.kindOfPayment) {
			errorMessage = errorMessage + "" + "Zahlungsart<br>";
		}
		if (!$scope.form.currency) {
			errorMessage = errorMessage + "" + "W�hrung<br>";
		}
		if (errorMessage.length > 0) {
			$ionicPopup.alert({
				title : '<b>Folgende Eingaben fehlen oder sind fehlerhaft:</b>',
				content : errorMessage
			});
		} else {
			theReceipt = {
				text : $scope.form.text,
				amount : $scope.form.amount,
				date : $scope.form.date,
				receiptKind : $scope.form.receiptKind,
				kindOfPayment : $scope.form.kindOfPayment,
				currency : $scope.form.currency,
				timestamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
			};
			if ($stateParams.guid == "new") {
				theReceipt.guid = $scope.generateGUID();
				$localstorage.insertObject('receipts', theReceipt);
			} else {
				theReceipt.guid = $stateParams.guid;
				$localstorage.updateObject('receipts', theReceipt);
			}
			$localstorage.setObject('lastCurrency', $scope.form.currency);
			if ($scope.$viewHistory.backView != null) {
				$scope.$viewHistory.backView.go();
			}
		}
	};
	// Currencie Modal
	$ionicModal.fromTemplateUrl('currencies-modal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.CurrenciesModal = modal;
	});
	$scope.data = {
		showListCurrencies : false,
		showListReceiptKinds : false,
		showListkindsOfPayment : false,
		searchQueryCurrencies : "",
		searchQueryReceiptKinds : "",
		searchQueryKindsOfPayment : ""
	};
	$scope.openCurrenciesModal = function () {
		$scope.CurrenciesModal.show();
		$timeout(function () {
			$scope.showListCurrencies = true;
		}, 100)
	};
	$scope.closeCurrenciesModal = function () {
		$scope.CurrenciesModal.hide();
	};
	$scope.type = true;
	$scope.setType = function (event) {
		if (angular.element(event.target).text() == "Favoriten") {
			$scope.type = true;
		} else {
			$scope.type = '';
		}
	};
	$scope.clearSearchCurrencies = function () {
		$scope.data.searchQueryCurrencies = '';
	};

	$scope.selectCurrency = function (currency) {
		$scope.form.currency = currency;
		$scope.closeCurrenciesModal();
	};
	// receiptKinds Modal
	$ionicModal.fromTemplateUrl('receiptKinds-modal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.receiptKindsModal = modal;
	});

	$scope.openReceiptKindsModal = function () {
		$scope.receiptKindsModal.show();
		$timeout(function () {
			$scope.showListReceiptKinds = true;
		}, 100)
	};
	$scope.closeReceiptKindsModal = function () {
		$scope.receiptKindsModal.hide();
	};
	$scope.clearSearchReceiptKinds = function () {
		$scope.data.searchQueryReceiptKinds = '';
	};
	$scope.selectReceiptKind = function (receiptKind) {
		$scope.form.receiptKind = receiptKind;
		$scope.closeReceiptKindsModal();
	};
	// KindsOfPayment Modal
	$ionicModal.fromTemplateUrl('kindsOfPayment-modal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.kindsOfPaymentModal = modal;
	});
	$scope.data = {};
	$scope.openKindsOfPaymentModal = function () {
		$scope.kindsOfPaymentModal.show();
		$timeout(function () {
			$scope.showListKindsOfPayment = true;
		}, 100)
	};
	$scope.closeKindsOfPaymentModal = function () {
		$scope.kindsOfPaymentModal.hide();
	};
	$scope.clearSearchKindsOfPayment = function () {
		$scope.data.searchQueryKindsOfPayment = '';
	};
	$scope.selectKindOfPayment = function (kindOfPayment) {
		$scope.form.kindOfPayment = kindOfPayment;
		$scope.closeKindsOfPaymentModal();
	};
})

.controller('receiptsCtrl', function ($scope, $timeout, $localstorage, $ionicLoading, $location) {

	$scope.go = function (hash) {
		$location.path(hash);
	}
	$scope.receipts = $localstorage.getObjects('receipts');

	$scope.show = function () {
		$ionicLoading.show({
			template : 'Synchronisieren...',
			duration : '1000'
		});
		$timeout(function () {
			$scope.$broadcast('scroll.refreshComplete');
		}, 1000);
	};
	$scope.hide = function () {
		$ionicLoading.hide();
	};
	$scope.removeReceipt = function (guid) {
		var x = $localstorage.getIndex('receipts', guid);
		$scope.receipts.splice(x, 1);
		$localstorage.removeObject('receipts', guid);
	};
})

.controller('settingsCtrl', function ($scope, $localstorage, $filter) {
	generateGUID = function () {
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		return guid;
	};
	$scope.create100Receipts = function () {
		for (var i = 0; i < 100; i++) {
			$localstorage.insertObject('receipts', {
				text : 'Beleg' + i,
				amount : "123",
				date : '2012-03-04',
				receiptKind : {
					description : "Bewirtung 100%",
					id : "2",
					isBusinessEntertainment : false,
					isHotel : false
				},
				kindOfPayment : {
					description : "Amex Privat",
					id : "1"
				},
				currency : {
					description : "Euro",
					isPreferred : true,
					symbol : "EUR"
				},
				timestamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				guid : generateGUID()
			});
		}
	};
})

.controller('infosCtrl', function ($scope) {})

.controller('updateReceiptCtrl', function ($scope, $localstorage, $stateParams) {
	console.log($localstorage.getObject('receipts', $stateParams.guid));
});
