const {
    desktopCapturer,
    screen
} = require('electron');
var remote = require('electron').remote;
var pid = remote.process.pid;
var dialog = remote.dialog;
var $ = require('jQuery');
var path = require('path');
require('shelljs/global');
const osTmpdir = require('os-tmpdir');
var ostemp = osTmpdir();
const Store = require('electron-store');
const store = new Store();
var kill = require('tree-kill');
const {
    shell
} = require('electron');
var appRootDir = require('app-root-dir').get();
var ffmpegsrc = appRootDir + '/ffmpeg/';
var os = require("os");
if (os.platform() == "darwin") {
    var ismac = 1;
} else {
    var ismac = 0;
}
if (ismac) {
    var ffmpegpath = appRootDir + '/node_modules/ffmpeg/ffmpeg';
    var ffprobepath = appRootDir + '/node_modules/ffmpeg/ffprobe';
    var appswitchpath = appRootDir + '/node_modules/ffmpeg/appswitch';
    var workdir = ostemp + '/' + maketemp();
} else {
    var winoriginal;
    var ffmpegpath = appRootDir + '\\node_modules\\ffmpeg\\ffmpeg.exe';
    var ffprobepath = appRootDir + '\\node_modules\\ffprobe\\ffprobe.exe';
    var sendkeysbatpath = appRootDir + '\\sendKeys.bat';
    var temporiginal = workdir + '\\temp.mp4';
    var workdir = ostemp + '\\' + maketemp();

}


var filelist = [];
var widtharr = [];
var heightarr = [];
var croppixelarr = [];
var aspect;
remote.getGlobal('workdirObj').prop1 = workdir;
console.log('tempdir: ' + remote.getGlobal('workdirObj').prop1);
var giffile;
var tempcrop = workdir + '/crop.mp4';
var previewfile = workdir + '/preview.png';
var previewindex = 0;
var lastperc = 0;
var lastpercUL = 0;
var fs = require('fs');
//var path = require('path');
var croppedfilelist = [];
var title, folder, finallink;
var ispreviewclip = 1;
var maxsize = 15;
var gifsize, size, selectedgifmb;
var megapixels, selectedwidth, selectedheight, calcgifheight, calcgifwidth, giflength, videowidth, videoheight, id;
var inprogress = false;
var gifrender = false;
var helpviewing = false;
var newhelp;
var helppending = false;
window.croppixelperc = 0.09;
const spawn = require('child_process').spawn;
const spawnsync = require('child_process').spawnSync;
//const spawnsync = require('child_process').spawnSync;

function maketemp() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function run_cmd(cmd, args, callBack) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";
    child.stdout.on('data', function(buffer) {
        resp += buffer.toString()
    });
    child.stdout.on('end', function() {
        callBack(resp)
    });
} // ()
var isdicom = 0;

function isclip(filename, filewithpath) {
    var clipext = ['mp4', 'm4v', 'avi', 'wmv', 'mov', 'flv', 'mpg', 'mpeg', 'gif'];
    for (var i = 0; i < clipext.length; i++) {
        if (filename.toLowerCase().split('.').pop().indexOf(clipext[i]) >= 0) {
            return (1);
        }
    }
    var filetype = spawnsync('file', ['-Ib', filewithpath, ]); // '| grep -i dicom']);
    var filetyperesult = filetype.stdout.toString().toLowerCase();
    var dicomsearch = filetyperesult.indexOf('dicom');
    //console.log(filetyperesult, isdicom);
    if (dicomsearch > -1) {
        isdicom = 1;
        return (1);
    }
    return (0);
}

function isstill(filename) {
    var stillext = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif'];
    for (var i = 0; i < stillext.length; i++) {
        if (filename.toLowerCase().split('.').pop().indexOf(stillext[i]) >= 0) {
            return (1);
        }
    }
    return (0);
}

function search(startPath) {
    var list = [];
    if (!fs.existsSync(startPath)) {
        return;
    }
    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            var list_temp = [];
            list_temp = search(filename); //recurse
            for (var m = 0; m < list_temp.length; m++) {
                list.push(list_temp[m]);
            }
        } else if (isclip(filename, files[i].path) > 0) {
            list.push(filename);
        }
    }
    return (list);
}
//allow drop on dahsed area
$("#filelistwrap").on('dragenter', function(event) {
    event.stopPropagation();
    event.preventDefault();
});
$("#filelistwrap").on('dragover', function(event) {
    event.stopPropagation();
    event.preventDefault();
});
$("#filelistwrap").on('drop', function(event) {
    event.preventDefault();
    filelist = [];
    var files = event.originalEvent.dataTransfer.files;
    if (ismac) {
        spawn(appswitchpath, ['-p', pid]);
    } else {
        spawn('cmd.exe', ['/c', 'call', '"' + sendkeysbatpath + '"', '"vidSmooth"', '""'], {
            windowsVerbatimArguments: true
        });
    }
    for (var i = 0; i < files.length; i++) {
        var name = files[i].name;
        var pathn = files[i].path;
        if (fs.lstatSync(pathn).isDirectory()) {
            var temp_list = [];
            temp_list = search(pathn);
            for (var k = 0; k < temp_list.length; k++) {
                if (filelist.indexOf(temp_list[k]) == -1) {
                    filelist.push(temp_list[k]);
                    index = filelist.length;
                    //$('#filelist').append(index + ': ' + temp_list[k] + '<br />');
                }
            }
        } else if (isclip(name, files[i].path) > 0) {
            if (filelist.indexOf(pathn) == -1) {
                filelist.push(pathn);
                index = filelist.length;
                //$('#filelist').append(index + ': ' + path + '<br />');
            }
        }
    }
    if (filelist.length == '0') {
        $('#drag').html('ugh, no clip found, try again');
    } else {
        $('#sidebar').show();
        $('#drag').css('visibility', 'hidden');
        $("#filelistwrap").hide();
        $('#maintitle').hide();
        //$('#loading-container').show();
        //preview();
        showoptions();
    }
});
$("#openmodalwrap").on('dragenter', function(event) {
    event.stopPropagation();
    event.preventDefault();
});
$("#openmodalwrap").on('dragover', function(event) {
    event.stopPropagation();
    event.preventDefault();
});
$("#openmodalwrap").on('drop', function(event) {
    event.preventDefault();
    filelist = [];
    var files = event.originalEvent.dataTransfer.files;
    if (ismac) {
        spawn(appswitchpath, ['-p', pid]);
    } else {
        spawn('cmd.exe', ['/c', 'call', '"' + sendkeysbatpath + '"', '"vidSmooth"', '""'], {
            windowsVerbatimArguments: true
        });
    }
    for (var i = 0; i < files.length; i++) {
        var name = files[i].name;
        var pathn = files[i].path;
        if (fs.lstatSync(pathn).isDirectory()) {
            var temp_list = [];
            temp_list = search(pathn);
            for (var k = 0; k < temp_list.length; k++) {
                if (filelist.indexOf(temp_list[k]) == -1) {
                    filelist.push(temp_list[k]);
                    index = filelist.length;
                    //$('#filelist').append(index + ': ' + temp_list[k] + '<br />');
                }
            }
        } else if (isclip(name, files[i].path) > 0) {
            if (filelist.indexOf(pathn) == -1) {
                filelist.push(pathn);
                index = filelist.length;
                //$('#filelist').append(index + ': ' + path + '<br />');
            }
        }
    }
    if (filelist.length == '0') {
        $('#drag').html('ugh, no clip found, try again');
    } else {
        $('#sidebar').show();
        $('#drag').css('visibility', 'hidden');
        $("#filelistwrap").hide();
        $('#maintitle').hide();
        //$('#loading-container').show();
        //preview();
        showoptions();
    }
});
//prevent ‘drop’ event on document.
$(document).on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
});
$(document).on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
});
$(document).on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
});


function queue(tasks) {
    let index = 0;
    const runTask = (arg) => {
        if (index >= tasks.length) {
            return Promise.resolve(arg);
        }
        return new Promise((resolve, reject) => {
            tasks[index++](arg).then(arg => resolve(runTask(arg))).catch(reject);
        });
    }
    return runTask();
}

function timeString2ms(a, b, c) { // time(HH:MM:SS.mss)
    return c = 0,
        a = a.split('.'), !a[1] || (c += a[1] * 1),
        a = a[0].split(':'), b = a.length,
        c += (b == 3 ? a[0] * 3600 + a[1] * 60 + a[2] * 1 : b == 2 ? a[0] * 60 + a[1] * 1 : s = a[0] * 1) * 1e3,
        c
}
var child;

function customSpawn(command, args) {
    return () => new Promise((resolve, reject) => {
        console.log(command + args.join(' '));
        if (!ismac) {
            var newargs = args.slice(0);
            newargs.unshift('"' + command + '"');
            newargs.unshift('/c');
            console.log(newargs);
            child = spawn('cmd.exe', newargs, {
                windowsVerbatimArguments: true
            });
        } else {
            child = spawn(command, args, {
                windowsVerbatimArguments: true
            });
        }

        var length = null;
        var currenttime = 0;
        var regex = /Duration:(.*), start:/;
        var regex2 = /time=(.*) bitrate/;
        child.stderr.on('data', (data) => {
            //console.log(command + args + `stderr: ${data}`);
            var buff = new Buffer(data);
            var str = buff.toString('utf8')
            console.log(str);

            if (fullviding || previewing) {
                var Duration_matches = str.match(regex);
                var Current_matches = str.match(regex2);
                if (Duration_matches) {
                    length = timeString2ms(Duration_matches[1]);
                }
                if (Current_matches) {
                    currenttime = timeString2ms(Current_matches[1]);
                }
                for (i = 0; i < args.length; i++) {
                    //console.log(args[i]);
                    if (args[i].indexOf('vidstabdetect') > -1) {
                        var pass = 1;
                    }
                }
                if (fullviding) {
                    // window.t1 = performance.now();
                    // //var left=(window.t1-window.t0)*stillcount/(i*1000);
                    // var duration = (window.t1-window.t0)/1000;
                    // var left=Math.round(duration*stillcount/i-duration);
                    // if(left>59){
                    //     var secs=left % 60;
                    //     var min=Math.floor(left/60);
                    //     var lefttext=min+' min '+secs+' sec left';
                    // } else {
                    //     var lefttext=left+' secs left';
                    // }

                    if (pass == 1) {
                        var offset = 0;
                        var mult = 0.5;
                    } else {
                        var offset = 0.5;
                        var mult = 0.5;
                    }
                    var percdone = offset + mult * currenttime / length;
                    if (!isNaN(percdone)) {
                        var perctext = '<br>[' + roundNumber(percdone * 100, 2) + '% done]';
                    } else {
                        var perctext = '';
                    }
                    $('#message').html('smoothing your video' + perctext);
                } else {
                    var offset = 0;
                    var mult = 1;
                }
                if (length) {
                    var percdone = offset + mult * currenttime / length;
                    var myqueue = [];
                    myqueue.push(progress(percdone));
                    queue(myqueue).then(([cmd, args]) => {}).catch(TypeError, function(e) {}).catch(err => console.log(err));
                }
            }
        });
        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        child.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject();
            }
        });
    });
}

function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

function progress(i) {
    return () => new Promise((resolve, reject) => {
        //stop = 100 * i;
        var elem = document.getElementById("myBar");
        elem.style.width = 100 * i + '%';
        console.log('perc: ' + (100 * i));
        resolve(i);
    });
}

function setupselect() {
    return () => new Promise((resolve, reject) => {
        var infile = filelist[0];

        if (ismac) {
            var ffprobe = spawnsync(ffprobepath, ['-select_streams', 'v:0', '-print_format', 'json', '-show_streams', '-i', infile]);
        } else {
            var ffprobe = spawnsync('cmd.exe', ['/c', '"' + ffprobepath + '"', '-select_streams', 'v:0', '-print_format', 'json', '-show_streams', '-i', infile], {
                windowsVerbatimArguments: true,
                cwd: process.cwd(),
                env: process.env,
                stdio: 'pipe',
                encoding: 'utf-8'
            });
        }

        console.log(ffprobe.output);

        var ffprobeOb = JSON.parse(ffprobe.stdout);
        console.log(ffprobeOb.streams[0]);
        window.width = ffprobeOb.streams[0].width;
        window.height = ffprobeOb.streams[0].height;
        aspect = window.width / window.height;
        if (ffprobeOb.streams[0].tags.rotate == 90 || ffprobeOb.streams[0].tags.rotate == 270) {
            aspect = 1 / aspect;
        }
        //console.log(aspect);
        window.duration = Number(ffprobeOb.streams[0].duration);
        window.fps = precisionRound(eval(ffprobeOb.streams[0].r_frame_rate), 4);
        window.codec = ffprobeOb.streams[0].codec_name;
        window.tpf = 1 / eval(window.fps);
        var canvasheight = parseInt(window.height * 600 / window.width);
        stillcount = ffprobeOb.streams[0].nb_frames;
        resolve(1);
    });

}

function createsample() {
    $('#message').html('creating your sample');
    fullviding = previewing = false;
    sampling = true;
    $('#helpmodal').html('<ul><li>be patient while I prepare your sample</li><li>If your clip is long or computer slow, get a coffee</li></ul>');
    fileonly = path.basename(filelist[0], path.extname(filelist[0]));
    $('#myProgress').show();
    $('button').hide();
    if (!fs.existsSync(workdir)) {
        fs.mkdirSync(workdir);
    }
    var myqueue = [];
    if (selectedMaxAngle == 360) {
        selectedMaxAngle = -1;
    } else {
        selectedMaxAngle = selectedMaxAngle * Math.PI / 360;
    }
    if ($('#tripod').val() == '1') {
        selectedsmooth = 0;
    }
    var samplelength = window.timeend - window.timestart;
    var transformvf = ' vidstabdetect -f null - ';
    var camera = $('#camera').val();
    var crop = $('#crop').val();
    if (ismac) {
        var trf = workdir + '/transforms.trf';
    } else {
        var trf = unixify(workdir + '\\transforms.trf'); //unixify = require('unixify');
    }
    var deshake = ',vidstabtransform=' + 'optalgo=' + camera + ':crop=' + crop + ':smoothing=' + selectedsmooth + ':input=' + trf + ':relative=1:maxshift=' + selectedmaxshift + ':maxangle=' + selectedMaxAngle + ',unsharp=5:5:0.8:3:3:0.4';
    //var vftext = 'scale=iw*min(1\\,min(600/iw\\,480/ih)):-1,setsar=1,scale=trunc(in_w/2)*2:trunc(in_h/2)*2';
    var vftext = 'setsar=1,scale=trunc(in_w/2)*2:trunc(in_h/2)*2';
    var transformvf = vftext + ',vidstabdetect=' + 'result=' + trf + ':shakiness=' + selectedshakiness + ':accuracy=' + selectedaccuracy; //+' -f null - ';
    var samplefile = workdir + '/sample.mp4';
    var mergedfile = workdir + '/merged.mp4';
    var clippedOriginal = workdir + '/clipped.mp4';
    if (aspect > 1) {
        var stack = "vstack";
    } else {
        var stack = "hstack";
    }
    myqueue.push(progress(0));
    myqueue.push(customSpawn(ffmpegpath, ['-ss', window.timestart, '-t', samplelength, '-i', filelist[0], '-y', '-vf', transformvf, '-f', 'null', '-']));
    myqueue.push(progress(0.33));
    myqueue.push(customSpawn(ffmpegpath, ['-ss', window.timestart, '-t', samplelength, '-i', filelist[0], '-y', '-vf', vftext + deshake, samplefile]));
    myqueue.push(progress(0.66));
    myqueue.push(customSpawn(ffmpegpath, ['-ss', window.timestart, '-t', samplelength, '-i', filelist[0], '-y', '-vf', vftext, clippedOriginal]));
    myqueue.push(customSpawn(ffmpegpath, ['-i', clippedOriginal, '-i', samplefile, '-y', '-filter_complex', stack, mergedfile]));
    myqueue.push(progress(1));
    myqueue.push(sampledump(1));
    queue(myqueue).then(([cmd, args]) => {
        console.log(cmd + ' finished - all finished');
    }).catch(TypeError, function(e) {}).catch(err => console.log(err));
}

function setupsample() {

}

function sampledump() {
    return () => new Promise((resolve, reject) => {
        newhelp = '<ul><li>Drag the start and stop sliders to trim your clip</li><li>Click the <span class=bordered>PREVIEW</span> button to see what your gif will look like when it plays</li><li>You can also use the <span class=bordered>SPACEBAR</span> to start and pause your clip</li><li>Pay special attention to the loop point for a seemless gif</li><li>You can also use your keyboard ARROW KEYS <ul id=arrowkeys><li>&#8593;</li><li>&#8592;</li><li>&#8595;</li><li>&#8594;</li></ul> to fine tune your selection</li><li>As of early 2018, Twitter limits gif duration to 30 seconds</li></ul>';
        if (!helpviewing) {
            $('#helpmodal').html(newhelp);
        } else {
            helppending = true;
        }
        var seconds = new Date().getTime() / 1000;
        var videoheight = parseInt(2 * window.height * 600 / window.width) + 'px';
        var cliphtml = '<video class=sample loop height=' + videoheight + ' width="600px" autoplay loop controls><source src="' + workdir + '/merged.mp4?v' + seconds + '" type=video/mp4></video>';
        $('#myProgress').hide();
        $('#message').hide();
        $('video').remove();
        $('.slidecontainer').hide();
        $('#selecttrim').prepend(cliphtml);
        $('#selecttrim,#restart,#changesettings,#fullvid,#savesample').show();
        $(document).keydown(function(e) {
            if (e.which == 32) { //up
                e.preventDefault();
                if (vid.paused) {
                    $('#previewclip').html('stop');
                    vid.currentTime = window.timestart;
                    vid.play();
                } else {
                    vid.pause();
                    $('#previewclip').html('preview');
                }
            }
        });
        setupclip();
        resolve(i);
    });
}

var fileonly, previewing, fullviding, sampling;

function preview() {
    var ext = path.extname(filelist[0]);
    const video = document.createElement('video');
    var canplay = video.canPlayType('video/' + ext);
    fullviding = sampling = false;
    previewing = true;
    var outfile = workdir + '/temp.mp4'
    $('#helpmodal').html('<ul><li>be patient while I prepare your preview</li><li>If your clip is long or computer slow, get a coffee</li></ul>');
    fileonly = path.basename(filelist[0], path.extname(filelist[0]));
    giffile = workdir + '/' + fileonly + '.gif';
    $('#myProgress').show();
    $('button').hide();
    if (!fs.existsSync(workdir)) {
        fs.mkdirSync(workdir);
    }
    var myqueue = [];
    var vftext = 'scale=iw*min(1\\,min(600/iw\\,480/ih)):-1,setsar=1,scale=trunc(in_w/2)*2:trunc(in_h/2)*2';
    myqueue.push(setupselect());
    if (!fs.existsSync(outfile)) {
        if (canplay != "") {
            console.log('convert');
            myqueue.push(customSpawn(ffmpegpath, ['-i', filelist[0], '-an', '-y', '-vf', vftext, outfile]));
            myqueue.push(previewdump(1, outfile));
        } else {
            myqueue.push(previewdump(1, filelist[0]));
        }
    } else {
        myqueue.push(previewdump(1, outfile));
    }

    queue(myqueue).then(([cmd, args]) => {
        console.log(cmd + ' finished - all finished');
    }).catch(TypeError, function(e) {}).catch(err => console.log(err));
}


function previewdump(i, file) {
    return () => new Promise((resolve, reject) => {
        newhelp = '<ul><li>Drag the start and stop sliders to trim your clip</li><li>Click the <span class=bordered>PREVIEW</span> button to see what your gif will look like when it plays</li><li>You can also use the <span class=bordered>SPACEBAR</span> to start and pause your clip</li><li>Pay special attention to the loop point for a seemless gif</li><li>You can also use your keyboard ARROW KEYS <ul id=arrowkeys><li>&#8593;</li><li>&#8592;</li><li>&#8595;</li><li>&#8594;</li></ul> to fine tune your selection</li><li>As of early 2018, Twitter limits gif duration to 30 seconds</li></ul>';
        if (!helpviewing) {
            $('#helpmodal').html(newhelp);
        } else {
            helppending = true;
        }
        var seconds = new Date().getTime() / 1000;
        var videoheight = parseInt(window.height * 600 / window.width) + 'px';
        var cliphtml = '<video class=added id=clip loop height=' + videoheight + ' width="600px"><source src="' + file + '?v' + seconds + '" type=video/mp4></video>';
        //$('#loading-container').hide();
        $('#myProgress').hide();
        $('video').remove();
        $('#selecttrim').prepend(cliphtml);
        $('#slidecontainer').show();
        $('#message').html('select the preview clip');
        $('#selecttrim, #message,#restart,#trimok,.slidecontainer,#previewclip,#createsample').show();

        $(document).keydown(function(e) {
            if (e.which == 32) { //up
                e.preventDefault();
                if (vid.paused) {
                    $('#previewclip').html('stop');
                    vid.currentTime = window.timestart;
                    vid.play();
                    html5Slider.noUiSlider.destroy();
                    updatescrubber();
                } else {
                    vid.pause();
                    $('#previewclip').html('preview');
                    html5Slider.noUiSlider.destroy();
                    loadscrubber();
                }
            }
        });
        setupclip();
        resolve(i);
    });
}




$('#restart').click(function() {
    spawnsync('rm', ['-rf', workdir]);
    $("#fadetoblack").show();
    $("#fadetoblack").animate({
        opacity: 1,
    }, 1000, function() {
        location.reload();
    });
});

$('#cancel').click(function() {
    spawnsync('rm', ['-rf', workdir]);
    $("#fadetoblack").show();
    kill(child.pid);
    $("#fadetoblack").animate({
        opacity: 1,
    }, 1000, function() {
        location.reload();
    });
});

var fullvid = 0;
$('#fullvid').click(function() {
    window.t0 = performance.now();
    fullviding = 1;
    $('#options').hide();
    $('button').hide();
    $('#helpmodal').html('<ul><li>Please wait while vidSmooth performs actual magic</li><li>If your endpoint was a specific file size, this might take a while</li></ul>');
    $('.dimentionsselectioncontainer').hide();
    $('#gifmbwrap').hide();
    $('#myProgress').show();
    $('#selecttrim').hide();
    $('#canvaswrap').hide();
    $('.btn').hide();
    $('#message').html('smoothing your video');
    $('#message').show();
    $('#cancel').show();
    var myqueue = [];
    myqueue.push(progress(0));
    if (!fs.existsSync(workdir)) {
        fs.mkdirSync(workdir);
    }

    if (selectedMaxAngle == 360) {
        selectedMaxAngle = -1;
    } else {
        selectedMaxAngle = selectedMaxAngle * Math.PI / 360;
    }
    if ($('#tripod').val() == '1') {
        selectedsmooth = 0;
    }
    var samplelength = window.timeend - window.timestart;
    var transformvf = ' vidstabdetect -f null - ';
    var camera = $('#camera').val();
    var crop = $('#crop').val();
    var tripod = $('#tripod').val();
    if (ismac) {
        var trf = workdir + '/transforms.trf';
    } else {
        var trf = unixify(workdir + '\\transforms.trf'); //unixify = require('unixify');
    }
    var deshake = 'vidstabtransform=' + 'optalgo=' + camera + ':crop=' + crop + ':smoothing=' + selectedsmooth + ':input=' + trf + ':relative=1:maxshift=' + selectedmaxshift + ':maxangle=' + selectedMaxAngle + ',unsharp=5:5:0.8:3:3:0.4';
    var transformvf = 'vidstabdetect=' + 'result=' + trf + ':shakiness=' + selectedshakiness + ':accuracy=' + selectedaccuracy;
    var finalFile = workdir + '/final.mp4';
    myqueue.push(customSpawn(ffmpegpath, ['-i', filelist[0], '-y', '-vf', transformvf, '-f', 'null', '-']));
    myqueue.push(customSpawn(ffmpegpath, ['-i', filelist[0], '-y', '-crf', '17', '-vf', deshake, finalFile]));
    myqueue.push(progress(1));
    myqueue.push(showfinal(1));
    queue(myqueue).then(([cmd, args]) => {
        console.log(cmd + ' finished - all finished');
    }).catch(TypeError, function(e) {}).catch(err => console.log(err));

});

function setfinalrender() {
    return () => new Promise((resolve, reject) => {
        gifrender = true;
        resolve(i);
    });
}

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}

function showfinal(i) {
    return () => new Promise((resolve, reject) => {
        //var timeleft = parseInt($('#label').css('width')) * 30;
        var timeleft = 0;
        newhelp = '<ul><li>Your gif is done, now do a little dance!</li><li>If you don\'t like the gif, start over</li><li>If you do like the gif, click and drag your gif to its destination</li><li>You can open a tweet and drag your gif straight into it, add some text and you\'re off to the races</li><li>You can drag your gif onto an app for further editing, like Photoshop</li><li>Of course, you can drag your gif to a specific folder to save it for later</li></ul>';
        if (!helpviewing) {
            $('#helpmodal').html(newhelp);
        } else {
            helppending = true;
        }
        //$('#message').delay(timeleft).html('Done! Drag your gif to an app, location, or tweet');
        $("#message").show();
        $("#message").html('Done!'); // Drag your gif to an app, location, or tweet');
        //$('#finalsize').html(size + 'MB/' + calcgifwidth + 'x' + calcgifheight + '/' + precisionRound(giflength, 2) + 's');
        var seconds = new Date().getTime() / 1000;
        var cliphtml = '<video class=sample id=final oop height=auto width="100%" autoplay loop controls><source src="' + workdir + '/final.mp4?v' + seconds + '" type=video/mp4></video>';

        $('#result').append(cliphtml).css('display', 'block');
        document.getElementById('final').ondragstart = (event) => {
            event.preventDefault()
            ipcRenderer.send('ondragstart', workdir + '/final.mp4')
        }
        $('#myProgress').hide();
        $('#finalsize').show();
        $('#save').show();
        $('#restart').show();
        $('#changesettings').show();
        //$('#openTwitter').show(0);
        resolve(i);
    });
}


$('#save').click(function() {
    fileonly = path.basename(filelist[0], path.extname(filelist[0]));
    filename = dialog.showSaveDialog({
        title: 'Save your file',
        defaultPath: '~/Desktop/' + fileonly + '_smoothed.mp4'
    }).then(result => {
        filename = result.filePath;
        if (filename === undefined) {
            console.log('the user clicked the btn but didn\'t created a file');
            return;
        }
        var filearr = filename.toLowerCase().split('.');
        var ext = filearr.pop();
        if (ext != 'mp4') {
            filename = filename + '.mp4';
        }
        var finalfile = workdir + '/final.mp4';
        fs.copyFile(finalfile, filename, (err) => {
            if (err) throw err;
            console.log('source.txt was copied to destination.txt');
        });
        shell.openItem(path.dirname(filename));
        if (ismac) {
            spawn(appswitchpath, ['-a', 'Finder']);
        } else {
            spawn('cmd.exe', ['/c', 'call', '"' + sendkeysbatpath + '"', '"vidSmooth"', '""'], {
                windowsVerbatimArguments: true
            });
        }
        $('#save').html('Saved');
        //$('#save').css('pointer-events', 'none'); //.prop('disabled', true); //disable
        //$('#save').hide();
        //$('#postSaveMessage').show();
    }).catch(err => {
        console.log(err)
    })

});

$('#savesample').click(function() {
    fileonly = path.basename(filelist[0], path.extname(filelist[0]));
    filename = dialog.showSaveDialog({
        title: 'Save your file',
        defaultPath: '~/Desktop/' + fileonly + '_sample_smoothed.mp4'
    }).then(result => {
        filename = result.filePath;
        if (filename === undefined) {
            console.log('the user clicked the btn but didn\'t created a file');
            return;
        }
        var filearr = filename.toLowerCase().split('.');
        var ext = filearr.pop();
        if (ext != 'mp4') {
            filename = filename + '.mp4';
        }
        var finalfile = workdir + '/merged.mp4';
        fs.copyFile(finalfile, filename, (err) => {
            if (err) throw err;
            console.log('source.txt was copied to destination.txt');
        });
        shell.openItem(path.dirname(filename));
        if (ismac) {
            spawn(appswitchpath, ['-a', 'Finder']);
        } else {
            spawn('cmd.exe', ['/c', 'call', '"' + sendkeysbatpath + '"', '"vidSmooth"', '""'], {
                windowsVerbatimArguments: true
            });
        }
        $('#save').html('Saved');
        //$('#save').css('pointer-events', 'none'); //.prop('disabled', true); //disable
        //$('#save').hide();
        //$('#postSaveMessage').show();
    }).catch(err => {
        console.log(err)
    })

});

const {
    ipcRenderer
} = require('electron');

ipcRenderer.send('resethtmlsize', '1');

var codec;

function getcodec(file) {
    var ffprobe = spawnsync(ffprobepath, ['-print_format', 'json', '-show_streams', '-i', file]);
    var ffprobeOb = JSON.parse(ffprobe.stdout);
    return ffprobeOb.streams[0].codec_name;
}

$('#help').click(function() {
    $('#helpmodalwrap').fadeIn();
    helpviewing = true;
});
$('#helpmodalwrap').click(function() {
    $(this).fadeOut(function() {
        helpviewing = false;
        if (helppending) {
            $('#helpmodal').html(newhelp);
            helppending = false;
        }
    });
});
var selectedsmooth, selectedmaxshift, selectedMaxAngle, selectedshakiness, selectedaccuracy;

function showoptions() {
    $('#result').hide();
    $("button").hide();
    $("#selecttrim").hide();
    $("#openmodalwrap").hide();
    $('#sample').show();
    $('#fullvid').show();
    $('#message').hide();
    $('#options').show();
    //$('#helpmodal').html('<ul><li>Please wait while vidSmooth performs actual magic</li><li>If your endpoint was a specific file size, this might take a while</li></ul>');
    $('#helpmodal').html('<p><ul><li>accuracy<br><ul><li>Set the accuracy of the detection process. It must be a value in the range 1-15. A value of 1 means low accuracy, a value of 15 means high accuracy. Default value is 15.</ul><li>shakiness<br><ul><li>Set the shakiness of input video or quickness of camera. It accepts an integer in the range 1-10, a value of 1 means little shakiness, a value of 10 means strong shakiness. Default value is 5.</ul><li>smoothing<br><ul><li>Set the number of frames (value*2 + 1), used for lowpass filtering the camera movements. Default value is 10.<br>For example, a number of 10 means that 21 frames are used (10 in the past and 10 in the future) to smoothen the motion in the video. A larger value leads to a smoother video, but limits the acceleration of the camera (pan/tilt movements). 0 is a special case where a static camera is simulated.</ul><li>maxshift<br><ul><li>Set maximal number of pixels to translate frames. </ul><li>maxangle<br><ul><li>Set maximal angle in radians (degree*PI/180) to rotate frames. </ul><li>crop method<br><ul><li>Specify how to deal with empty frame borders that may be shrinked-in due to movement compensation. Available values are:<br>keep: Keep image information from previous frame (default).<br>black: Fill the border-areas black.</ul><li>camera path<br><ul><li>Set the camera path optimization algorithm. Accepted values are:<br>gauss: Gaussian kernel low-pass filter on camera motion (default).<br>avg: Averaging on transformations.</ul><li>tripod<br><ul><li>Enables virtual tripod mode if set to "on", which is equivalent to smoothing=0. Default value is "off".</ul></ul>');
    selectedsmooth = store.get('selectedsmooth') || 200;
    var pipFormatssmooth = {
        '0': '0',
        '25': '25',
        '50': '50',
        '75': '75',
        '100': 'max'
    };
    //window.tpf=2000/34329;
    var selectsmooth = document.getElementById("smooth");
    noUiSlider.create(selectsmooth, {
        step: 1,
        //limit:window.timeend,
        tooltips: false, // [true, wNumb({ suffix: 's'}), true],
        start: selectedsmooth,
        connect: true,
        range: {
            'min': [0, 1],
            '25%': [25, 1],
            '50%': [50, 1],
            '75%': [75, 1],
            'max': [100, 1]
        },
        pips: {
            mode: "range",
            format: {
                to: function(a) {
                    return pipFormatssmooth[a];
                }
            }
        }
    });
    selectsmooth.noUiSlider.on("slide", function(values, handle) {
        selectedsmooth = parseInt(values[handle]);
        store.set('selectedsmooth', selectedsmooth);
    });
    selectedmaxshift = store.get('selectedmaxshift') || 200;
    var pipFormatsmaxshift = {
        '0': '0',
        '50': '50',
        '100': '100',
        '150': '150',
        '200': 'max'
    };
    //window.tpf=2000/34329;
    var selectmaxshift = document.getElementById("maxshift");
    noUiSlider.create(selectmaxshift, {
        step: 1,
        //limit:window.timeend,
        tooltips: false, // [true, wNumb({ suffix: 's'}), true],
        start: selectedmaxshift,
        connect: true,
        range: {
            'min': [0, 1],
            '25%': [50, 1],
            '50%': [100, 1],
            '75%': [150, 1],
            'max': [200, 1]
        },
        pips: {
            mode: "range",
            format: {
                to: function(a) {
                    return pipFormatsmaxshift[a];
                }
            }
        }
    });
    selectmaxshift.noUiSlider.on("slide", function(values, handle) {
        selectedmaxshift = parseInt(values[handle]);
        store.set('selectedmaxshift', selectedmaxshift);
    });
    //selectedMaxAngle = 360;
    selectedMaxAngle = store.get('selectedMaxAngle') || 360;
    //window.tpf=2000/34329;
    var selectMaxAngle = document.getElementById("maxangle");
    var pipFormatsMaxAngle = {
        '0': '0',
        '90': '90',
        '180': '180',
        '270': '270',
        '360': 'max'
    };
    noUiSlider.create(selectMaxAngle, {
        step: 1,
        range: {
            'min': [0, 1],
            '25%': [90, 1],
            '50%': [180, 1],
            '75%': [270, 1],
            'max': [360, 1]
        },
        //limit:window.timeend,
        tooltips: false, // [true, wNumb({ suffix: 's'}), true],
        start: selectedMaxAngle,
        connect: true,

        pips: {
            // Show a scale with the slider
            mode: "range",
            format: {
                to: function(a) {
                    return pipFormatsMaxAngle[a];
                }
            }
        }
    });
    selectMaxAngle.noUiSlider.on("slide", function(values, handle) {
        selectedMaxAngle = parseInt(values[handle]);
        store.set('selectedMaxAngle', selectedMaxAngle);
    });

    //********//
    selectedshakiness = store.get('selectedshakiness') || 5;
    var selectshakiness = document.getElementById("shakiness");
    noUiSlider.create(selectshakiness, {
        step: 1,
        //limit:window.timeend,
        tooltips: false, // [true, wNumb({ suffix: 's'}), true],
        start: selectedshakiness,
        connect: true,
        range: {
            'min': 1,
            'max': 10
        },
        pips: {
            mode: 'values',
            values: [2, 4, 6, 8, 10],
            density: 10
        }
    });
    selectshakiness.noUiSlider.on("slide", function(values, handle) {
        selectedshakiness = parseInt(values[handle]);
        store.set('selectedshakiness', selectedshakiness);
    });

    selectedaccuracy = store.get('selectedaccuracy') || 15;
    var selectaccuracy = document.getElementById("accuracy");
    noUiSlider.create(selectaccuracy, {
        step: 1,
        //limit:window.timeend,
        tooltips: false, // [true, wNumb({ suffix: 's'}), true],
        start: selectedaccuracy,
        connect: true,
        range: {
            'min': 1,
            'max': 15
        },
        pips: {
            mode: 'values',
            values: [1, 5, 10, 15],
            density: 7
        }
    });
    selectaccuracy.noUiSlider.on("slide", function(values, handle) {
        selectedaccuracy = parseInt(values[handle]);
        store.set('selectedaccuracy', selectedaccuracy);
    });
    $('#sample').show();
    $('#fullvid').show();
}

$('#sample').click(function() {
    $('#sample').hide();
    $('#fullvid').hide();
    $('#options').hide();
    var camera = $('#camera').val();
    var crop = $('#crop').val();
    //console.log(selectedsmooth, selectedmaxshift, selectedMaxAngle);
    preview();
});

$('#createsample').click(function() {
    //alert('createsample');
    $('#selecttrim').hide();
    $('button').hide();
    createsample();
});

$('#changesettings').click(function() {
    showoptions();
});
$('select').change(function() {
    var id = $(this).attr('id');
    store.set(id, $(this).val());
});

$('select').each(function() {
    var id = $(this).attr('id');
    if (store.get(id)) {
        $(this).val(store.get(id));
    }
});

$('#ffmpegsource').click(function() {
    var ffmpegsrc = appRootDir + '/ffmpeg';
    shell.openItem(ffmpegsrc);
});
$('#gpl').click(function() {
    var url = "http://www.gnu.org/licenses/old-licenses/gpl-2.0.html";
});