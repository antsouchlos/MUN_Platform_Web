function getName(path) {
    var filename = path.replace(/^.*[\\\/]/, '')
    return filename;
}

function upload() {
    if (document.getElementById("fileChooser").value == "") {
        alert("You must choose a file to upload");
    } else {
        /*var progressBar = document.getElementById("progressBar");
        var progress = document.getElementById("progress");

        progressBar.style.visibility="visible";
        progress.style.visibility="visible";

        var width = 1;
        var id = setInterval(frame, 10);

        function frame() {
            if (width >= 100) {
                clearInterval(id);
                alert("File uploaded successfully: " + document.getElementById("fileChooser").value);
            } else {
                width++; 
                progress.style.width = width + '%'; 
                document.getElementById("progressLabel").innerHTML = width + '%';
            }
        }*/
        var path = document.getElementById("fileChooser").value;
        
        var rootRef = firebase.storage.ref();
        var fileRef = rootRef.child(getName(path));
        fileRef.put(path);

    }
}

function init() {
    var progressBar = document.getElementById("progressBar");
    var progress = document.getElementById("progress");

    progressBar.style.visibility = "hidden";
    progress.style.visibility = "hidden"; 
}

window.onload = init;