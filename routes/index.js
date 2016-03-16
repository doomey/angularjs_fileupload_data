var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var AWS = require('aws-sdk');
var path = require('path');
var s3Config = require('../config/s3config');
var async = require('async');
var fs = require('fs');
var mime = require('mime');
var articleData = require('../mockData/mockData.json');

router.post('/articles', function(req, res, next) {

	// multipart/form-data로 POST 요청을 보낼 경우 요청 헤더의 content-type은
	// multipart/form-data; boundary=----WebKitFormBoundaryutn6oMxPH4sDdGtF와 같은 값을 가진다.
	if (req.headers['content-type'].startsWith('multipart/form-data')) {
		var form = new formidable.IncomingForm();
		form.uploadDir = path.join(__dirname, '../uploads');
		form.keepExtensions = true;
		form.multiples = true;
		form.parse(req, function(err, fields, files) {
			var s3Urls = [];
			if (files.photo instanceof Array) { // 사진을 여러 장 업로드할 경우
				async.each(files.photo,
					function(file, cb) {
						var fileName = path.basename(file.path);
						var s3 = new AWS.S3({
							"accessKeyId": s3Config.key,
							"secretAccessKey": s3Config.secret,
							"region": s3Config.region,
							"params": {
								"Bucket": s3Config.bucket,
								"Key": s3Config.imageDir + "/" + fileName,
								"ACL": s3Config.imageACL,
								"ContentType": mime.lookup(fileName)
							}
						});

						var body = fs.createReadStream(file.path);
						s3.upload({ "Body": body })
							.on('httpUploadProgress', function(event) {
								console.log(event);
							})
							.send(function(err, data) {
								fs.unlink(files.photo.path);
								if (err) {
									cb(err);
								} else {
									s3Urls.push(data.Location);
									cb();
								}
							});
					},
					function(err) {
						if (err) {
							next(err);
						} else {
							var result = {
								"id": articleData.length + 1,
								"title": fields.title,
								"content": fields.content,
								"s3Urls": s3Urls
							};

							articleData.push(result);
							console.log(articleData);
							res.json(result);
						}
					}
				);
			} else if (!files['photo']) { // 사진을 올리지 않은 경우
				var result = {
					"id": articleData.length + 1,
					"title": fields.title,
					"content": fields.content,
					"s3Urls": []
				};

				articleData.push(result);
				console.log(articleData);
				res.json(result);
			} else { // 사진을 한 장 올렸을 경우
				var fileName = path.basename(files.photo.path);
				var s3 = new AWS.S3({
					"accessKeyId": s3Config.key,
					"secretAccessKey": s3Config.secret,
					"region": s3Config.region,
					"params": {
						"Bucket": s3Config.bucket,
						"Key": s3Config.imageDir + "/" + fileName,
						"ACL": s3Config.imageACL,
						"ContentType": mime.lookup(fileName)
					}
				});

				var body = fs.createReadStream(files.photo.path);
				s3.upload({ "Body": body })
					.on('httpUploadProgress', function(event) {
						console.log(event);
					})
					.send(function(err, data) {
						fs.unlink(files.photo.path);
						if (err) {
							next(err);
						} else {
							s3Urls.push(data.Location);

							var result = {
								"id": articleData.length + 1,
								"title": fields.title,
								"content": fields.content,
								"s3Urls": s3Urls
							};

							articleData.push(result);
							console.log(articleData);
							res.json(result);
						}
					});
			}
		});
	} else { // 요청 헤더의 content-type이 존재하지 않거나, application/x-www-form-urlencoded일 경우
		var result = {
			"id": articleData.length + 1,
			"title": req.body.title,
			"content": req.body.content,
			"s3Urls": []
		};
		articleData.push();
		console.log(articleData);
		res.json(result);
	}
});

module.exports = router;
