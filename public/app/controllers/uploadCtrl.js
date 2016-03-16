angular.module('fileUploadApp', ['ngFileUpload'])
	.constant('articlesUrl', 'http://localhost:3000/articles')
	.controller('uploadCtrl', function ($scope, Upload, $timeout, articlesUrl) {
		$scope.uploadPic = function(file) {
			file.upload = Upload.upload({
				url: articlesUrl,
				data: {
					title: $scope.title,
					content: $scope.content,
					photo: file
				}
			});

			file.upload.then(function (response) {
				$timeout(function () {
					file.result = response.data;
				});
			}, function (response) {
				if (response.status > 0)
					$scope.errorMsg = response.status + ': ' + response.data;
			}, function (evt) {
				file.progress = parseInt(100.0 * evt.loaded / evt.total);
			});
		}
	});