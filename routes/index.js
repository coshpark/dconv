var express = require('express');
var router = express.Router();
var kue = require('kue');
var spawn = require('child_process').spawn;
var multer = require('multer')
var moment = require('moment')
var axios = require('axios');
var fs = require('fs');
var path  = require('path')
var cors = require('cors')
var config = require('../config')


var storage = multer.diskStorage({
	destination: (req,file,cb)=> {
		cb(null,'./files');
	},
	filename: (req,file,cb)=> {
    cb(null, moment().format('YYYYMMDD_HHmmss_SS-') + file.originalname);
  }
});

var upload = multer({ storage: storage });

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use(cors())

//
// GET /download/:name
//
router.get('/download/:name', function(req, res, next) {
  console.log("file download: " + req.params.name)
  var filePath = './files/' + req.params.name
  var name = req.params.name.slice(19)

  res.download(filePath, name)
});

//
// GET /file/:name
//
router.get('/file/:name', function(req, res, next) {
  console.log("file download")
  var filePath = './files/' + req.params.name

  res.contentType("application/pdf");
  fs.readFile(filePath , function (err,data){
    res.contentType("application/pdf");
    res.send(data);
  })
});

//
// POST /job
//   Req: file, url
//   Res: {success , message}
//
router.post('/job', upload.single('file'), function(req, res, next) {
  var rq = {
    path: config.path + req.file.path,
    noti: req.body.url
  }

  createJob(rq);

  var name  = path.basename(rq.path , path.extname(rq.path))
  var filePath = name + '.pdf'
  res.json({ 'success':'1', 'message':'ok', path: filePath });
});

//
// GET /job
//   Req: file, url
//   Res: {success , message}
//
router.get('/job', function(req, res, next) {
  var rq = {
    path: req.query.file,
    noti: req.query.url
  }

  createJob(rq);
  res.json({ 'success':'1', 'message':'ok' });
})


var jobs = kue.createQueue();

function createJob(rq) {
  console.log("createJob():");
  console.log(rq);

  var job  = jobs.createJob( 'dconv', { rq: rq, } ); 

  job.on( 'complete', function () {
    console.log( "Job complete %d", job.id );
  } ).on( 'failed', function () {
    console.log( "Job failed%d %d", job.id );
  } ).on( 'progress', function ( progress ) {
    process.stdout.write( '\r  job #' + job.id + ' ' + progress + '% complete' );
  } );

  job.save();
}

function notifyRes(url, code, filePath) {
  var resdata = {
    success: code  ? 1 : 0,
    name: filePath.slice(19),
    file: code ? filePath : filePath,
  }

  if (url) {
    axios.get(url, {
      params: resdata,
    }).then( res => {
      console.log('noti ok');
    })
    .catch( err => {
      console.log('noti error');
      console.log(err);
    })
  }
  else if (global.io) {
    global.io.emit('message', resdata)
  }
}

jobs.process('dconv', 3, function ( job, done ) {
  console.log("jobs.process(): " + job.id)
  console.log(job.data.rq)

  var type = path.extname(job.data.rq.path)
  console.log("type: " + type)

  var name  = path.basename(job.data.rq.path , path.extname(job.data.rq.path))
  var filePath = name + '.pdf'

  if (!config.conv[type]) {
    console.log("Invalid file type");
    notifyRes(job.data.rq.noti, 0, filePath);
    done();
    return;
  }

  console.log(config.conv[type])

  var proc = spawn(config.conv[type].mod, [ ...config.conv[type].args, job.data.rq.path]);
  proc.stdout.setEncoding('utf8');

  proc.stdout.on('data', function (data) {
      var str = data.toString()
      var lines = str.split(/(\r?\n)/g);
      console.log(lines.join(""));
  });

  proc.stderr.on('data', function (data) {
    var str = data.toString()
    var lines = str.split(/(\r?\n)/g);
    console.log(lines.join(""));
  });

  proc.on('close', function (code) {
      console.log('process exit code : ' + code);

      code = code ? 1 : 0;
      console.log('code = ' + code)
      console.log('--' + job.data.rq.noti)

      // Verify 

      if (fs.existsSync('./files/' + filePath)) {
        console.log("The file exists") 
        var st = fs.statSync('./files/' + filePath)
        console.log(st)
        if (st.size == 0)  code = 0
      } else {
        console.log("The file not exists") 
        code = 0;
      }
      notifyRes(job.data.rq.noti, code, filePath) 
      done()
  });
});


// For test purposes
router.get('/ok', function(req, res, next) {
  console.log("notification test ---") 
  console.log(req.query)
  res.json({ 'success':'1'});
});


module.exports = router;
