angular.module('fileUploadApp', ['ngFileUpload'])//[] : module dependency injection. 의존성 주입.. 문자열을 넣으면 된다.
	.constant('articlesUrl', 'http://localhost:3000/articles/')//url 뒤에 되도록 / 을 붙이자.
	.controller('uploadCtrl', function ($scope, Upload, $timeout, articlesUrl) { //'컨트롤러 이름', function(함수 내부에서 사용할 객체들). $는 내장 서비스를 의미한다.
		$scope.uploadPhoto = function(file) { //scope 함수는 view에서 접근이 가능하다.
			file.upload = Upload.upload({ // 이 모듈이 업로드 기능을 구현...
				url: articlesUrl,
				data: {
					title: $scope.title,
					content: $scope.content,
					photo: file
				}
			}); //FormData(html5 API) 객체에 대한 Promise 객체 생성

			file.upload.then(function (response) {
				$timeout(function () {
                    $scope.title = "";
                    $scope.content = "";
                    file.result = response.data;
				});
			}, function (response) {
				if (response.status > 0)
					$scope.errorMsg = response.status + ': ' + response.data;
			}, function (evt) {
				file.progress = parseInt(100.0 * evt.loaded / evt.total);
			});
            //$http.post(..).success(function(){}).error(function(){})
		}
        $scope.deletePhoto = function(prop){
            $scope[prop] = null;
        }

        $scope.reset = function() {
            $scope.title = "";
            $scope.content = "";
            $scope.photoFile = null;
        }
	});