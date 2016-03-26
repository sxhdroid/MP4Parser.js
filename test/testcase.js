var ModuleTestMP4Parser = (function(global) {

var test = new Test(["MP4Parser"], { // Add the ModuleName to be tested here (if necessary).
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     false,  // enable worker test.
        node:       false,  // enable node test.
        nw:         true,  // enable nw.js test.
        el:         true,  // enable electron (render process) test.
        button:     true,  // show button.
        both:       true,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
        callback:   function() {
        },
        errorback:  function(error) {
            console.error(error.message);
        }
    });

if (IN_BROWSER || IN_NW || IN_EL) {
    test.add([
        testMP4Parse_parseMP4File,
        testMP4Parse_compareH264RawStream,
    ]);
}

// --- test cases ------------------------------------------
function testMP4Parse_parseMP4File(test, pass, miss) {
    //
    // $ npm run make_asset
    // $ npm run el
    //
    // ff/png.00.mp4 をパースし結果をJSONと比較する
    var mp4File  = "../assets/ff/png.00.mp4";
    var jsonFile = "../assets/json/png.00.mp4.json";
    var task = new Task("testMP4Parse_parseMP4File", 2, function(error, buffer) {
        var json0 = JSON.stringify(buffer[0], null, 2);
        var mp4box = MP4Parser.parse( new Uint8Array(buffer[1]) );
        var json1 = JSON.stringify(mp4box, null, 2);

        if (json0 === json1) {
            test.done(pass());
        } else {
            test.done(miss());
        }
    });

    FileLoader.loadJSON(jsonFile, function(json, url) {
        console.log("testMP4Parse_parseMP4File. load file: ", url);
        task.buffer[0] = json;
        task.pass();
    });

    FileLoader.toArrayBuffer(mp4File, function(buffer, url) {
        console.log("testMP4Parse_parseMP4File. load file: ", url, buffer.byteLength);
        task.buffer[1] = new Uint8Array(buffer);
        task.pass();
    });
}

function testMP4Parse_compareH264RawStream(test, pass, miss) {
    //
    // $ npm run make_asset
    // $ npm run el
    //
    // ff/png.00.mp4 をパースし ff/png.00.mp4.264 と中身を比較する

    var h264RawStreamFile = "../assets/ff/png.00.mp4.264";
    var mp4File = "../assets/ff/png.00.mp4";

    var task = new Task("testMP4Parse_compareH264RawStream", 2, function(error, buffer) {
        var videoH264RawStream = buffer[0];
        var videoNALUnitObject = H264["convertRawStreamToNALUnitObject"]( videoH264RawStream );

        // videoNALUnitObject の中身を確認する
        var verify = false;
        if (videoNALUnitObject[0].NAL_UNIT_TYPE === "SEI" && videoNALUnitObject[0].data.length === 628) {
            if (videoNALUnitObject[1].NAL_UNIT_TYPE === "IDR" && videoNALUnitObject[1].data.length === 205) {
                verify = true;
            }
        }
        if (!verify) {
            test.done(miss());
            return;
        }

        // mp4box.mdat と videoH264RawStream を比較する
        var mp4box = MP4Parser.parse( new Uint8Array( buffer[1] ) );

        if ( videoH264RawStream.length === mp4box.root.mdat.data.length) {
            if (_binaryCompare(videoH264RawStream, mp4box.root.mdat.data) ) {
                test.done(pass());
                return;
            }
        }
        test.done(miss());
    });

    FileLoader.toArrayBuffer(h264RawStreamFile, function(buffer, url) {
        console.log("testMP4Parse_compareH264RawStream: ", url, buffer.byteLength);
        task.buffer[0] = new Uint8Array(buffer);
        task.pass();
    });

    FileLoader.toArrayBuffer(mp4File, function(buffer, url) {
        console.log("testMP4Parse_compareH264RawStream: ", url, buffer.byteLength);
        task.buffer[1] = new Uint8Array(buffer);
        task.pass();
    });
}

function _binaryCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (var i = 0, iz = a.length; i < iz; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

return test.run();

})(GLOBAL);

