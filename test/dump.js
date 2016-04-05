#!/usr/bin/env node

require("../lib/WebModule.js");

WebModule.VERIFY  = true;
WebModule.VERBOSE = true;
WebModule.PUBLISH = true;

require("../node_modules/uupaa.task.js/lib/Task.js");
require("../node_modules/uupaa.task.js/lib/TaskMap.js");
require("../node_modules/uupaa.fileloader.js/lib/FileLoader.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.hexdump.js/lib/HexDump.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/node_modules/uupaa.bit.js/lib/Bit.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/node_modules/uupaa.bit.js/lib/BitView.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnitType.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnitParameterSet.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnitEBSP.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnitAUD.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnitSPS.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnitPPS.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnitSEI.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnitIDR.js");
require("../node_modules/uupaa.h264.js/node_modules/uupaa.nalunit.js/lib/NALUnit.js");
require("../node_modules/uupaa.h264.js/lib/H264.js");
require("../node_modules/uupaa.typedarray.js/lib/TypedArray.js");
require("./wmtools.js");
require("../lib/MP4Parser.js");


var inputFiles = [
    "./assets/ff/png.00_01.mp4",
    "./assets/ff/png.00_01_02.mp4",
    "./assets/ff/png.00_01_02_03.mp4",
    "./assets/ff/png.00_01_02_03_04.mp4",
    "./assets/ff/png.all.mp4",
    "./assets/ff/png.all.mp4.01.ts.mp4",
//    "~/oss/my/assets/movie/1.mp4",
//    "~/oss/my/assets/movie/2.mp4",
];
var outputFiles = [
    "./assets/js/png.00_01.mp4.json",
    "./assets/js/png.00_01_02.mp4.json",
    "./assets/js/png.00_01_02_03.mp4.json",
    "./assets/js/png.00_01_02_03_04.mp4.json",
    "./assets/js/png.all.mp4.json",
    "./assets/js/png.all.mp4.01.ts.mp4.json",
//    "~/assets/js/1.mp4",
//    "~/assets/js/2.mp4",
];

for (var i = 0, iz = inputFiles.length; i < iz; ++i) {
    dump(inputFiles[i], outputFiles[i]);
}

function dump(inputFile, outputFile) {
    FileLoader.toArrayBuffer(inputFile, function(buffer) {
        console.log("MP4Parser.parse: ", inputFile, buffer.byteLength);

        //MPEG2TS.VERBOSE = false;
        //MPEG2TSParser.VERBOSE = false;
        //MPEG4ByteStream.VERBOSE = false;
        //MP4Muxer.VERBOSE = false;
        NALUnitEBSP.VERBOSE = false
        MP4Parser.VERBOSE = false;

        var mp4tree = MP4Parser.parse( new Uint8Array(buffer), 0, { diagnostic: true } );
        var result = JSON.stringify(mp4tree.diagnostic.boxes, null, 2)
                   + JSON.stringify(mp4tree.root.moov.trak[0].mdia.minf.stbl, null, 2)
                   + JSON.stringify({ mvhd: mp4tree.root.moov.mvhd }, null, 2);

        require("fs").writeFileSync(outputFile, result, "utf8"); // Finder で確認
        console.log("WRITE TO: ", outputFile);

    }, function(error) {
        console.error(error.message);
    });
}


