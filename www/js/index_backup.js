 
function deviceReady(){
    console.log('deviceready')
    //console.log(window.resolveLocalFileSystemURL('cdvfile://localhost/'))

}


const folder = ()=>{
   return cordova.platformId === "browser"? cordova.file.dataDirectory
   :cordova.platformId === "ios"?
        dataDirectory
   :
    cordova.file.applicationStorageDirectory;
}

const extFolder = ()=>{
   return cordova.file.externalApplicationStorageDirectory+'files/';
}

let firstData = [];

const getMp3 = ()=>{

    const file = document.getElementById('encrypt-input').files[0]

    parseFile(file, (binaryData)=>{

            //firstData = [...firstData,binaryData];
            // var blob = binaryData;//new Blob([new Uint8Array(e.target.result)], { type: "enc/cry" });

                byteString = binaryData;
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                 var blob = new Blob([ab]);




         window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory+'files/',function(dirEntry){
            console.log('new direntry for filr: ',dirEntry);


            saveFile(dirEntry, blob, randomName());
    },console.log)



    })

    
}

document.querySelector('.start').onclick = getMp3;


function randomName (){

    return Math.round(Math.random()*10000000)+"_"+Math.round(Math.random()*8547952114)+'.crp';
}






function parseFile(file, callback) {
    var fileSize   = file.size;
    var chunkSize  = 10*1024*1024; // bytes
    var offset     = 0;
    var self       = this; // we need a reference to the current object
    var chunkReaderBlock = null;

    var readEventHandler = function(evt) {
        document.getElementById('compleated').innerHTML = offset;
       
        document.getElementById('filesize').innerHTML = fileSize;
        document.getElementById('percentage').innerHTML = (offset/fileSize*100)+' %';

       

        if (evt.target.error == null) {
            offset += evt.target.result.length;
            
            callback(evt.target.result); // callback for handling read chunk
        } else {
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (offset >= fileSize) {
            console.log("Done reading file");
            return;
        }



        // of to the next chunk
        chunkReaderBlock(offset, chunkSize, file);
    }

    chunkReaderBlock = function(_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = readEventHandler;
        // r.readAsDataURL(blob);


         r.readAsBinaryString(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
}






























function c(){


    window.resolveLocalFileSystemURL(folder(),function(e){

    },console.log)
}



function createFile(dirEntry, fileName, isAppend) {
    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {

        writeFile(fileEntry, null, isAppend);

    }, log);

}

function writeFile(fileEntry, dataObj,isAppend) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }
        if (isAppend) {
            try {
                fileWriter.seek(fileWriter.length);
            }
            catch (e) {
                console.log("file doesn't exist!");
            }
        }

        fileWriter.write(dataObj);
    });
}


function readFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
            console.log(fileEntry.fullPath + ": " + this.result);
        };

       reader.readAsText(file);
        
    }, log);
}

function log(e){console.log(e)}












function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}

let fileEnt;

function newWay(){

    if(myfiles.length < counter+1){
            console.log('done')
                return
            }

        if(!fileEnt){
             window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory+'files/',function(dirEntry){
                    console.log('new direntry for filr: ',dirEntry);


                    dirEntry.getFile('result.file', { create: true, exclusive: false }, function (fileEntry) {

                            fileEnt = fileEntry;
                        

                    })
                },log)
        }

    let fileEntry = myfiles[counter];
    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
            let byteString = e.target.result;
            var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                 var blob = new Blob([ab]);
               
                 writeFile(fileEnt, blob,true,newWay);
               
                counter+=1;
            
            
        };
        
        reader.readAsBinaryString(file);

    })

}








let myfiles = [];

let finalData = [];


let counter = 0;

function readmyfiles(){

    let fileEntry = myfiles[counter];
    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
            console.log(e);
            finalData = [...finalData,e.target.result];
            //finalData = [...finalData,dataURItoBlob(e.target.result)];

            if(finalData.length == myfiles.length){

                    let byteString = finalData.join('');

                //let byteString ="";
                // for (var i = 0;i<finalData.length; i++) {
                //     byteString += atob(finalData[i].split(',')[1])
                // }



                //byteString = finalData.join('');
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                 var blob = new Blob([ab]);
                myCallback(blob);
                
                //ConcatenateBlobs (finalData, 'enc/cry', myCallback)
                return
            }
            counter+=1;
            readmyfiles()
            
        };
        // reader.readAsText(file);
        //reader.readAsArrayBuffer(file);
        reader.readAsBinaryString(file);

    })        
}


function myCallback(res,callto){
    fileData = res;
                

                window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory+'files/',function(dirEntry){
                    console.log('new direntry for filr: ',dirEntry);


                    dirEntry.getFile('result.file', { create: true, exclusive: false }, function (fileEntry) {

                        writeFile(fileEntry, fileData,true,callto);

                    })
                },log)
}




function gg(){


window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory+'files/',function(e){
    console.log(e);
    getSampleFile(e);
    },console.log)



window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {

    console.log('file system open: ' + fs.name);
    getSampleFile(fs.root);

}, log);

}

function getSampleFile(dirEntry) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://cordova.apache.org/static/img/cordova_bot.png', true);
    xhr.responseType = 'blob';

    xhr.onload = function() {
        if (this.status == 200) {

            var blob = new Blob([this.response], { type: 'image/png' });
            saveFile(dirEntry, blob, "downloadedImage.png");
        }
    };
    xhr.send();
}

function saveFile(dirEntry, fileData, fileName) {

    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {

        writeFile(fileEntry, fileData);

    }, log);
}











        


        

  












function writeFile(fileEntry, dataObj, isAppend,callto) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");


            if(!callto) myfiles = [...myfiles,fileEntry];

            if(callto) callto(); 
        };

        fileWriter.onerror = function(e) {
            console.log("Failed file write: " + e.toString());
        };

        if (isAppend) {
            try {
                fileWriter.seek(fileWriter.length);
            }
            catch (e) {
                console.log("file doesn't exist!");
            }
        }




        fileWriter.write(dataObj);
    });
}

function readBinaryFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {

            console.log("Successful file write: " + this.result);
            console.log(fileEntry.fullPath + ": " + this.result);

            var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
            displayImage(blob);
        };

        reader.readAsArrayBuffer(file);

    }, log);
}

function displayImage(blob) {

    // Displays image if result is a valid DOM string for an image.
    var elem = document.getElementById('imageFile');
    // Note: Use window.URL.revokeObjectURL when finished with image.
    elem.src = window.URL.createObjectURL(blob);
}

function displayImageByFileURL(fileEntry) {
    var elem = document.getElementById('imageFile');
    elem.src = fileEntry.toURL();
}














(function() {
    function ConcatenateBlobs (blobs, type, callback) {
        var buffers = [];

        var index = 0;

        function readAsArrayBuffer() {
            if (!blobs[index]) {
                return concatenateBuffers();
            }
            var reader = new FileReader();
            reader.onload = function(event) {
                buffers.push(event.target.result);
                index++;
                readAsArrayBuffer();
            };
            reader.readAsArrayBuffer(blobs[index]);
        }

        readAsArrayBuffer();

        function concatenateBuffers() {
            var byteLength = 0;
            buffers.forEach(function(buffer) {
                byteLength += buffer.byteLength;
            });
            
            var tmp = new Uint16Array(byteLength);
            var lastOffset = 0;
            buffers.forEach(function(buffer) {
                // BYTES_PER_ELEMENT == 2 for Uint16Array
                var reusableByteLength = buffer.byteLength;
                if (reusableByteLength % 2 != 0) {
                    buffer = buffer.slice(0, reusableByteLength - 1)
                }
                tmp.set(new Uint8Array(buffer), lastOffset);
                lastOffset += reusableByteLength;
            });

            var blob = new Blob([tmp.buffer], {
                type: type
            });

            callback(blob);
        }
    }

    if(typeof modules !== 'undefined') {
        modules.export = ConcatenateBlobs;
    }

    if(typeof window !== 'undefined') {
        window.ConcatenateBlobs = ConcatenateBlobs;
    }
})();













 document.addEventListener('deviceready',deviceReady , false);