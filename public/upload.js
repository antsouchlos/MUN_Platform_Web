//takes a path as an argument and returns only the filename
function getName(path) {
    var filename = path.replace(/^.*[\\\/]/, '')
    return filename;
}

function upload() {
    if (document.getElementById("fileChooser").value == "") {
        alert("You must choose a file to upload");
    } else if (document.getElementById("resName").value == "") {
        alert("You must choose a name for your resolution");
    } else {
        //set up the firebase references
        var path = document.getElementById("fileChooser").value;
        
        /*var rootRef = firebase.storage.ref();
        var fileRef = rootRef.child(document.getElementById("resName").value);
        */
        alert(path);
        /*
        //upload the file
        var uploadTask = fileRef.put(path);
        
        //make the progressbar visible
        var progressBar = document.getElementById("progressBar");
        var progress = document.getElementById("progress");

        progressBar.style.visibility="visible";
        progress.style.visibility="visible";
        
        //handle the file upload
        uploadTask.on('state_changed', function (snapshot) {
            //handle events
            
            var progress = (snapshot.bytesTransfered / snapshot.totalBytes) * 100;
            progress.style.width = progress + '%';
            document.getElementById("progressLabel").innerHTML = progress + '%';
            
        }, function(error) {
            //handle errors
            
            alert("An error occurred while uploading the file");
            
        }, function() {
            //handle successful uploads
            
        });*/
        

    }
}

function init() {
    //hide the progressbar
    
    var progressBar = document.getElementById("progressBar");
    var progress = document.getElementById("progress");

    progressBar.style.visibility = "hidden";
    progress.style.visibility = "hidden"; 
}

window.onload = init;