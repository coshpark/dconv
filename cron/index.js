const CronJob = require('cron').CronJob;
const findRemoveSync = require('find-remove')
const config = require('../config.js')

rm_path = config.path + 'files'
console.log("targe directory: " + rm_path)

console.log('Before job instantiation');

const job = new CronJob('00 00 00 * * *', function() {
	const d = new Date();
	console.log('Fire:', d);
	var result = findRemoveSync(rm_path, { age: {seconds: 60 * 60 * 24}, files: "*.*" })
	console.log(result)
});

console.log('After job instantiation');

job.start();
