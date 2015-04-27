var path = require('path');
var spawn = require('child_process').spawn;

var cmd       = require('commander');
var glob      = require('glob');
var async     = require('async');
var untildify = require('untildify');


// Command Line Parsing

var indent = '        ';
cmd.version('1.0.0')
    .option('-d, --directory <path>', 'The directory of images to convert.\n' +
            indent + 'If not given, the directory will be "."')
    .option('-r, --resolution <resolutions>', 'A comma separated\n' +
            indent + 'list of resolutions (a resolution is two numbers\n' +
            indent + 'separated by x, such as 800x640). For each\n' +
            indent + 'resolution, a copy of each image will be created at\n' +
            indent + 'that resolution.')
    .parse(process.argv);


// Parse Resolutions

var res = [];

if (cmd.resolution && cmd.resolution.split) {
    cmd.resolution.split(',').forEach(function(curRes, i) {
        var whStr = curRes.split('x');
        var wh = {w: parseInt(whStr[0], 10), h: parseInt(whStr[1], 10)};
        if (wh.w + 'x' + wh.h !== curRes) {
            console.log('[WARN] Could not parse, ignoring resolution: ' +
                        curRes);
        } else {
            res.push(wh);
        }
    });
}

if (res.length < 1) {
    console.log('[ERROR] No correct resolutions given, exiting.');
    return;
}


// Create and Execute Jobs
var globPattern = path.join(untildify(cmd.directory || '.'),
                            '*.@(jpg|jpeg|png)');
glob(globPattern, function(err, files) {
    if (err) {
        console.log('[ERROR] Could not get files in ' + cmd.directory +
                    ' because: ' + err + ', exiting.');
        return;
    }

    var jobs = [];
    files.forEach(function(file, i) {
        res.forEach(function(r, i) {
            jobs.push({ fn: file, w: r.w, h: r.h });
        });
    });

    console.log('[INFO] Starting conversions...');

    var jobsDone = 0;
    async.mapLimit(jobs, 4, function(job, cbk) {
        var fnRes = job.w + 'x' + job.h;
        var fnExt = path.extname(job.fn);
        var fnNew = path.join(path.dirname(job.fn),
                              path.basename(job.fn, fnExt)+'-'+fnRes+fnExt);

        spawn('convert', [job.fn, 
              '(','+clone','-shave','2x2',
              ')','+swap','-gravity','center','-composite',

              '(','+clone','-set','option:distort:viewport',
                    fnRes + '-%[fx:'+job.w+'/2-w/2]-%[fx:'+job.h+'/2-h/2]',
                    '-virtual-pixel','Mirror',
                    '-distort','SRT','0',
                    '+repage','-flatten',
              ')', '+swap','-gravity','center','-compose','over','-composite',

              fnNew])

        .on('close', function() {
            jobsDone += 1;
            console.log('[INFO] [Job '+jobsDone+' / '+jobs.length+'] ' +
                        'Finish converting to ' + fnRes + ' for ' + job.fn);

            cbk(null, null);
        });


    }, function(err, results) {
        if (err) {
            console.log('[ERROR] ' + err);
        } else {
            console.log('[INFO] Completed.');
        }
    });
});
