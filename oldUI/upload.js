function init() {
    //hide the progressbar

    var progressBar = document.getElementById("progressBar");
    var progress = document.getElementById("progress");

    progressBar.style.visibility = "hidden";
    progress.style.visibility = "hidden";


    var fileChooser = document.getElementById("fileChooser");
    var resName = document.getElementById("resName");

    //set listener on the filechooser
    fileChooser.addEventListener('change', function(e) {

	if (resName.value == "") {
            alert("You must choose a name for the resolution");
	} else {
	    //make the progress bar visible
            progressBar.style.visibility="visible";
            progress.style.visibility="visible";

            //get file
            var file = e.target.files[0];

            //create storage ref
	    var storageRef = firebase.storage().ref("resolutions/" + resName.value);

            //upload file
            var uploadTask = storageRef.put(file);

            //handle the file upload
            uploadTask.on('state_changed',

                function progress(snapshot) {
                    var progressPerc = (snapshot.bytesTransfered / snapshot.totalBytes) * 100;
                    progress.style.width = progressPerc + '%';
                    document.getElementById("progressLabel").innerHTML = progressPerc + '%';
                },

                function error(err) {
                    alert("An error occurred while uploading file");
                },

                function complete() {
                    //set progress to 100%
                    progress.style.width = 100 + '%';
                    document.getElementById("progressLabel").innerHTML = '100%';

                    //----add the resolution to the realtime database----
                    var rootRef = firebase.database().ref();
                    var counterRef = rootRef.child('counter');

                    var counter;

                    //boolean to make sure the code doesn't execute every time the counter changes
                    var read = false;

                    //get the value of the counter
                    counterRef.on('value', function(snapshot) {
                        if (!read) {
                            read = true;

                            counter = parseInt(snapshot.val()) + 1;

                            //create the new resolution-reference
                            var databaseRef = firebase.database().ref().child('resolutions').child(counter.toString());

                            //set the name of the new resolution
                            databaseRef.set(resName.value);

                            //update the counter
                            counterRef.set(counter.toString());
                        }
                    });
                }
            );
        }
    });
}

window.onload = init;
