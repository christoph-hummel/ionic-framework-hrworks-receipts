angular.module('starter.controllers', ['ionic'])

// Controller of the Receipt View
.controller('receiptCtrl', function ($scope, $localstorage, $filter, $ionicActionSheet, $ionicPopup, $ionicModal, $timeout, $stateParams, $translate) {
	$translate(['EDIT_RECEIPT', 'NEWRECEIPT', 'OPTIONS', 'COPY', 'ERROR', 'COPYRECEIPT_ERROR', 'COPYRECEIPT', 'COPYRECEIPT_INFO', 'CANCEL', 'OK', 'DELETE', 'COPYOF']).then(function (translations) {
		
		// Create a translation array for the controller
		$scope.translationsArray = [];
		$scope.translationsArray["EDIT_RECEIPT"] = translations.EDIT_RECEIPT;
		$scope.translationsArray["NEWRECEIPT"] = translations.NEWRECEIPT;
		$scope.translationsArray["OPTIONS"] = translations.OPTIONS;
		$scope.translationsArray["COPY"] = translations.COPY;
		$scope.translationsArray["ERROR"] = translations.ERROR;
		$scope.translationsArray["COPYRECEIPT_ERROR"] = translations.COPYRECEIPT_ERROR;
		$scope.translationsArray["COPYRECEIPT"] = translations.COPYRECEIPT;
		$scope.translationsArray["COPYRECEIPT_INFO"] = translations.COPYRECEIPT_INFO;
		$scope.translationsArray["CANCEL"] = translations.CANCEL;
		$scope.translationsArray["OK"] = translations.OK;
		$scope.translationsArray["DELETE"] = translations.DELETE;
		$scope.translationsArray["COPYOF"] = translations.COPYOF;

		// Clears the copyGUID of the localStorage
		$localstorage.setObject('copyGUID', new Array());
		
		// HACK: removes the tabs in the view. Update if there is a better way
		var tabs = document.querySelectorAll('div.tabs')[0];
		tabs = angular.element(tabs);
		angular.element(document).find('ion-content').addClass('remove-tabs');
		tabs.css('display', 'none');
		$scope.$on('$destroy', function () {
			tabs.css('display', '');
		});
		
		// Put the data form the localStorage into the scope
		$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
		$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
		$scope.currencies = $localstorage.getObjects('currencies');
		$scope.form = {};
		$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
		$scope.form.currency = $localstorage.getObjects('lastCurrency');
		$scope.form.persons = "";
		$scope.form.persons = $localstorage.getObjects('user').person + ',';
		$scope.form.kindOfPayment = "";
		$scope.form.receiptKind = "";
		
		// Set the title of the view
		if ($stateParams.guid != "new") {
			$scope.form = $localstorage.getObject('receipts', $stateParams.guid);
			$scope.receiptTitle = $scope.translationsArray['EDIT_RECEIPT'];
		} else {
			$scope.receiptTitle = $scope.translationsArray['NEWRECEIPT'];
		}
		
		// HACK: Set the amount input type of Android devices to text
		$scope.selectAmountInputType = function () {
			if (ionic.Platform.isIOS()) {
				return "number";
			}
			if (ionic.Platform.isAndroid()) {
				return "text";
			}
			return "text";
		}
		
		// Create a GUID
		$scope.generateGUID = function () {
			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = Math.random() * 16 | 0,
					v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			return guid;
		};
		
		// Return true if there is a GUID of a receipt
		$scope.isEdit = function () {
			if ($stateParams.guid != "new") {
				return true;
			}
			return false;
		};
		
		// Copying a receipt
		$scope.saveCopyReceipt = function () {
			theReceiptCopy = {
				text : $scope.form.text,
				amount : parseFloat($scope.form.amount),
				date : $scope.form.date,
				receiptKind : $scope.form.receiptKind,
				kindOfPayment : $scope.form.kindOfPayment,
				currency : $scope.form.currency,
				timeStamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				guid : $scope.generateGUID()
			};
			if ($scope.form.receiptKind.isHotel == true) {
				theReceiptCopy.endDate = $scope.form.endDate;
			}
			if ($scope.form.receiptKind.isBusinessEntertainment == true) {
				theReceiptCopy.reason = $scope.form.reason;
				theReceiptCopy.persons = $scope.form.persons;
				theReceiptCopy.place = $scope.form.place;
			}
			theReceiptCopy.guid = $stateParams.guid;
			$localstorage.updateObject('receipts', theReceiptCopy);
			theReceiptCopy.guid = $scope.generateGUID();
			theReceiptCopy.text =  $scope.translationsArray["COPYOF"] + ' ' + $scope.form.text;
			theReceiptCopy.timeStamp = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ');
			$localstorage.insertObject('receipts', theReceiptCopy);
			$localstorage.setObject('copyGUID', {
				guid : theReceiptCopy.guid
			});
			$scope.$viewHistory.backView.go();
		};
		
		// Write into the localeStorage that the user doesn't want to see the info altert again
		$scope.hideData = {};
		$scope.setHideAlert = function () {
			$localstorage.setObject('hideAlert', {
				hideAlert : true
			});
		};
		
		// Show the ActionSheet with the options
		$scope.showActionsheet = function () {
			$ionicActionSheet.show({
				titleText : $scope.translationsArray['OPTIONS'],
				buttons : [{
						text : "<i class='icon ion-ios7-copy-outline'></i> " + $scope.translationsArray['COPYRECEIPT']
					},
				],
				destructiveText : $scope.translationsArray['DELETE'],
				cancelText : $scope.translationsArray['CANCEL'],
				scope : $scope,
				buttonClicked : function (index) {
					if (index == 0) {
						if (!$scope.form.text || !$scope.form.date
							 || !$scope.form.receiptKind || !$scope.form.kindOfPayment || !$scope.form.currency
							 || !$scope.amountValid() || typeof $scope.form.amount === 'undefined') {
							$ionicPopup.alert({
								title : "<b>" + $scope.translationsArray['COPYRECEIPT'] + "</b>",
								content : $scope.translationsArray['COPYRECEIPT_ERROR']
							});
							return true;
						}
						if ($scope.form.receiptKind.isHotel) {
							console.log("isHotel");
							if (!$scope.form.endDate || $scope.form.date > $scope.form.endDate) {
								console.log("is invalid isHotel");
								$ionicPopup.alert({
									title : "<b>" + $scope.translationsArray['COPYRECEIPT'] + "</b>",
									content : "Fehler Hotel"
								});
								return true;
							}
						}
						if ($scope.form.receiptKind.isBusinessEntertainment) {
							console.log("isBusinessEntertainment");
							if (!$scope.personsValid() || !$scope.form.reason || !$scope.form.place) {
								console.log("is inValid isBusinessEntertainment");
								$ionicPopup.alert({
									title : "<b>" + $scope.translationsArray['COPYRECEIPT'] + "</b>",
									content : "Fehler BusinessEntertainment"
								});
								return true;
							}
						}
						if ($localstorage.getObjects('hideAlert').hideAlert == true) {
							$scope.saveCopyReceipt();
							return true;
						} else {
							var confirmPopup = $ionicPopup.show({
									title : "<b>" + $scope.translationsArray['COPYRECEIPT'] + "</b>",
									template : $scope.translationsArray['COPYRECEIPT_INFO'],
									scope : $scope,
									buttons : [{
											text : $scope.translationsArray['CANCEL'],
											onTap : function (e) {
												return 1;
											}
										}, {
											text : "<b>" + $scope.translationsArray['OK'] + "</b>",
											type : "button-positive",
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
				},
				destructiveButtonClicked : function () {
					console.log($scope.form.guid);
					$localstorage.removeObject('receipts', $scope.form.guid);
					$scope.$viewHistory.backView.go();
				}
			});
		};
		
		// Check if the amout input is valid
		$scope.amountValid = function () {
			var regex = /^(\d+(?:[\.\,]\d{0,2})?)$/;
			if (!regex.test($scope.form.amount) && typeof $scope.form.amount !== 'undefined') {
				return false;
			}
			return true;
		}
		// Check if the person input is valid
		$scope.personsValid = function () {
			if ($scope.form.receiptKind.isBusinessEntertainment == true) {
				if ($scope.form.persons.length > 0) {
					var thePersonsArray = $scope.form.persons.split(",");
					theNewPersonsArray = [];
					for (var i = 0; i < thePersonsArray.length; i++) {
						if (thePersonsArray[i] !== "" && thePersonsArray[i] !== null) {
							theNewPersonsArray.push(thePersonsArray[i]);
						}
					}
					if (theNewPersonsArray.length < 2) {
						return false;
					} else {
						return true;
					}
				}
			}
		}
		
		// Save receipt
		$scope.saveReceipt = function () {
			$scope.form.amount = $scope.form.amount.toString().replace(",", ".");
			var error = false;
			if ($scope.form.date > $scope.form.endDate) {
				error = true;
			}
			if ($scope.amountValid() == false) {
				error = true;
			}
			if ($scope.personsValid() == false) {
				error = true;
			}
			if (error == false) {
				theReceipt = {
					text : $scope.form.text,
					amount : parseFloat($scope.form.amount),
					date : $scope.form.date,
					receiptKind : $scope.form.receiptKind,
					kindOfPayment : $scope.form.kindOfPayment,
					currency : $scope.form.currency,
					timeStamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				};
				if ($scope.form.receiptKind.isHotel == true) {
					theReceipt.endDate = $scope.form.endDate;
				}
				if ($scope.form.receiptKind.isBusinessEntertainment == true) {
					theReceipt.reason = $scope.form.reason;
					theReceipt.persons = $scope.form.persons;
					theReceipt.place = $scope.form.place;
				}
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
		// Write Modal information into the scope
		$scope.data = {
			showListCurrencies : false,
			showListReceiptKinds : false,
			showListkindsOfPayment : false,
			searchQueryCurrencies : "",
			searchQueryReceiptKinds : "",
			searchQueryKindsOfPayment : ""
		};
		
		// Currencies Modal
		$ionicModal.fromTemplateUrl('templates/currencies-modal.html', {
			scope : $scope,
			animation : 'slide-in-up'
		}).then(function (modal) {
			$scope.CurrenciesModal = modal;
		});
		
		// Open Currencies Modal
		$scope.openCurrenciesModal = function () {
			var inputs = angular.element(document.querySelectorAll('input'));
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].blur && inputs[i].blur();
			}
			$scope.CurrenciesModal.show();
			$timeout(function () {
				$scope.showListCurrencies = true;
			}, 400);
		};
		
		// Close Currencies Modal
		$scope.closeCurrenciesModal = function () {
			$scope.CurrenciesModal.hide();
		};
		
		// Set type for the currencies selection "Favorites" and "All Currencies"
		$scope.type = true;
		$scope.setType = function (event) {
			if (angular.element(event.target).hasClass('fav')) {
				$scope.type = true;
			} else {
				$scope.type = '';
			}
		};
		
		// Clear the currencies searchbox
		$scope.clearSearchCurrencies = function () {
			$scope.data.searchQueryCurrencies = '';
		};
		
		// Select a currency
		$scope.selectCurrency = function (currency) {
			$scope.form.currency = currency;
			$scope.closeCurrenciesModal();
		};
		
		// receiptKinds Modal
		$ionicModal.fromTemplateUrl('templates/receiptKinds-modal.html', {
			scope : $scope,
			animation : 'slide-in-up'
		}).then(function (modal) {
			$scope.receiptKindsModal = modal;
		});
		
		// Open the receiptKinds Modal
		$scope.openReceiptKindsModal = function () {
			var inputs = angular.element(document.querySelectorAll('input'));
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].blur && inputs[i].blur();
			}
			$scope.receiptKindsModal.show();
			$timeout(function () {
				$scope.showListReceiptKinds = true;
			}, 300)
		};
		
		// Close the receiptKinds Modal
		$scope.closeReceiptKindsModal = function () {
			$scope.receiptKindsModal.hide();
		};
		
		// Clear the receiptKind searchbox
		$scope.clearSearchReceiptKinds = function () {
			$scope.data.searchQueryReceiptKinds = '';
		};
		
		// Select a receiptKind
		$scope.selectReceiptKind = function (receiptKind) {
			$scope.form.receiptKind = receiptKind;
			$scope.closeReceiptKindsModal();
		};
		
		// KindsOfPayment Modal
		$ionicModal.fromTemplateUrl('templates/kindsOfPayment-modal.html', {
			scope : $scope,
			animation : 'slide-in-up',
		}).then(function (modal) {
			$scope.kindsOfPaymentModal = modal;
		});
		
		// Open KindsOfPayment Modal
		$scope.data = {};
		$scope.openKindsOfPaymentModal = function () {
			var inputs = angular.element(document.querySelectorAll('input'));
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].blur && inputs[i].blur();
			}
			$scope.kindsOfPaymentModal.show();
			$timeout(function () {
				$scope.showListKindsOfPayment = true;
			}, 100);
		};
		
		// Close KindsOfPayment Modal
		$scope.closeKindsOfPaymentModal = function () {
			$scope.kindsOfPaymentModal.hide();
		};
		
		// Select KindsOfPayment
		$scope.selectKindOfPayment = function (kindOfPayment) {
			$scope.form.kindOfPayment = kindOfPayment;
			$scope.closeKindsOfPaymentModal();
		};
	});
})

.controller('receiptsCtrl', function ($scope, $ionicPopup, $timeout, $localstorage, $ionicLoading, $translate, $location, $ionicModal, getData) {
	$translate(['WRONGCREDENTIALS_TITLE', 'WRONGCREDENTIALS_TEMPLATE']).then(function (translations) {
		$scope.translationsArray = [];
		$scope.translationsArray["WRONGCREDENTIALS_TITLE"] = translations.WRONGCREDENTIALS_TITLE;
		$scope.translationsArray["WRONGCREDENTIALS_TEMPLATE"] = translations.WRONGCREDENTIALS_TEMPLATE;

		$ionicModal.fromTemplateUrl('templates/login-modal.html', {
			scope : $scope,
			hardwareBackButtonClose : false
		}).then(function (modal) {
			$scope.LoginModal = modal;
			if (typeof $localstorage.getObjects('user').personId === 'undefined') {
				$scope.LoginModal.show();
			}
		});
		$scope.user = {};
		$scope.user.companyId = "jaco";
		$scope.user.personId = "jaco";
		$scope.user.mobilePassword = "hjpjpkf";
		$scope.user.targetServer = "area51-0";
		$scope.login = function (user) {
			var promise = getData.userLogin(user);
			if (promise == false) {
				return false
			}
			$ionicLoading.show({
				template : "<i class='icon ion-loading-c'></i><br> {{ 'PLEASEWAIT' | translate }}",
			});
			promise.then(function (success) {
				if (success.errors.length == 0) {
					$scope.user.person = success.result.person;
					$localstorage.setObject("user", user);
					var dataPromise = getData.all();
					dataPromise.then(function (success) {
						$scope.receipts = $localstorage.getObjects('receipts');
						$ionicLoading.hide();
						$scope.LoginModal.hide();
					})
				} else {
					if (success.errors[0].errorId == "8") {
						$ionicLoading.hide();
						$ionicPopup.alert({
							title : $scope.translationsArray["WRONGCREDENTIALS_TITLE"],
							template : $scope.translationsArray["WRONGCREDENTIALS_TEMPLATE"]
						});
					} else {
						console.log(success.errors[0]);
					}
				}
			}, function (failed) {
				console.log(failed);
			});
		};
		if (typeof $localstorage.getObjects('copyGUID').guid !== 'undefined') {
			$location.path('/tab/receipt/' + $localstorage.getObjects('copyGUID').guid);
		}
		$scope.go = function (hash) {
			$location.path(hash);
		}
		$scope.receipts = $localstorage.getObjects('receipts');
		$scope.doSync = function () {
			$ionicLoading.show({
				template : "<i class='icon ion-loading-c'></i><br>{{ 'SYNCHRONIZE' | translate }}",
			});
			var promise = getData.all();
			promise.then(function () {
				$scope.receipts = $localstorage.getObjects('receipts');
				$ionicLoading.hide();
			});
		}
		$scope.doRefresh = function () {
			$scope.$broadcast('scroll.refreshComplete');
			$scope.doSync();
			$scope.receipts = $localstorage.getObjects('receipts');
		};
		$scope.removeReceipt = function (guid) {
			var x = $localstorage.getIndex('receipts', guid);
			$scope.receipts.splice(x, 1);
			$localstorage.removeObject('receipts', guid);
		};

		$scope.openLoginModal = function () {
			$scope.LoginModal.show();
		};
	})
})

// Controller of the View Settings
.controller('settingsCtrl', function ($ionicPopup, $ionicLoading, $state, $scope, $http, $localstorage, $cordovaNetwork, $filter, $translate, getData) {

	// HACK: Hides the tabs if the keyboard is open
	angular.element(document.querySelectorAll('div.tabs')[0]).addClass('hide-on-keyboard-open');
	
	// Load the translations for the controller
	$translate(['SUCCESS_SETTINGS_TITLE', 'SUCCESS_SETTINGS_TEMPLATE', 'SUCCESS_SETTINGS_TITLE', 'ERROR_SETTINGS_TEMPLATE']).then(function (translations) {
	
		// Put the the translations into a translation Array
		$scope.translationsArray = [];
		$scope.translationsArray["SUCCESS_SETTINGS_TITLE"] = translations.SUCCESS_SETTINGS_TITLE;
		$scope.translationsArray["SUCCESS_SETTINGS_TEMPLATE"] = translations.SUCCESS_SETTINGS_TEMPLATE;
		$scope.translationsArray["ERROR_SETTINGS_TITLE"] = translations.ERROR_SETTINGS_TITLE;
		$scope.translationsArray["ERROR_SETTINGS_TEMPLATE"] = translations.ERROR_SETTINGS_TEMPLATE;
		
		// Get the user datas from the localStorage
		$scope.form = $localstorage.getObjects('user');
		
		// Save the Settings
		$scope.saveSettings = function (form) {
			var promise = getData.userLogin(form);
			promise.then(function (success) {
				if (success.errors.length == 0) {
					$scope.form.person = success.result.person;
					$localstorage.setObject('receipts', new Array());
					$localstorage.setObject("user", form);
					$ionicLoading.show({
						template : "<i class='icon ion-loading-c'></i><br>{{ 'SYNCHRONIZE' | translate }}",
					});
					var promise = getData.all();
					promise.then(function () {
						$ionicLoading.hide();
						$ionicPopup.alert({
							title : $scope.translationsArray['SUCCESS_SETTINGS_TITLE'],
							template : $scope.translationsArray['SUCCESS_SETTINGS_TEMPLATE']
						});
					})
				} else {
					if (success.errors[0].errorId == "8") {
						$ionicPopup.alert({
							title : $scope.translationsArray['ERROR_SETTINGS_TITLE'],
							template : $scope.translationsArray['ERROR_SETTINGS_TEMPLATE'],
						});
					} else {
						console.log(success.errors[0]);
					}
				}
			}, function (failed) {
				console.log(failed);
			});
		};
		
		// Set type to true if the language is "de"
		if ($translate.use() == "de") {
			$scope.type = true;
		} else {
			$scope.type = "";
		};
		
		// Change language
		$scope.changeLang = function (key, event) {
			if (angular.element(event.target).hasClass('de')) {
				$scope.type = true;
			} else {
				$scope.type = '';
			}
			$translate.use(key).then(function (key) {
				$localstorage.setObject('language', {
					language : key
				});
				if($cordovaNetwork.isOffline()) {
					return false;
				}
				$ionicLoading.show({
					template : "<i class='icon ion-loading-c'></i><br>{{ 'SYNCHRONIZE' | translate }}",
				});
				var promise = getData.all();
				promise.then(function () {
					$ionicLoading.hide();
				})
			}, function (key) {
				console.log("Error");
			});
		};
		
		// Delete this function if you throw out the "Create 100 Receipts" Button
		generateGUID = function () {
			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = Math.random() * 16 | 0,
					v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			return guid;
		};
		
		// Create 100 Receipts
		$scope.create100Receipts = function () {
			for (var i = 0; i < 100; i++) {
				$localstorage.insertObject('receipts', {
					text : 'Beleg' + i,
					amount : 123,
					date : '2012-03-04',
					receiptKind : {
						"description" : "Benzin (Ausland)",
						"id" : "7",
						"isHotel" : false,
						"isBusinessEntertainment" : false
					},
					kindOfPayment : {
						"isDefault" : true,
						"description" : "Bar Privat",
						"id" : "3"
					},
					currency : {
						description : "Euro",
						isPreferred : true,
						symbol : "EUR"
					},
					timeStamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
					guid : generateGUID()
				});
			}
		}
	});
})

// Controller of the Info View
.controller('infosCtrl', function ($scope, $window) {
	angular.element(document.querySelectorAll('div.tabs')[0]).addClass('hide-on-keyboard-open');
	$scope.mail = {};
	$scope.sendFeedback = function () {
		var link = "mailto:mobile.support@hrworks.de?subject=" + $scope.mail.subject + "&body=" + $scope.mail.text;
		$window.location.href = link;
	}
})
