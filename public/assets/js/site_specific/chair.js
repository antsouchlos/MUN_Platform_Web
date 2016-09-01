function init() {    
    var fileChooser = document.getElementById("fileChooser");
    var resName = document.getElementById("resName");

    var file = null;
    
    //set listener on the filechooser
    fileChooser.addEventListener('change', function(e) {
        //get file
        file = e.target.files[0];
    });
                                 
    //add listener to the "upload" button
    var upload_link = document.getElementById("upload_link");
    upload_link.onclick = function() {
        if (resName.value == "") {
            alert("You must choose a name for the resolution");
        } else if (file == null) {
            alert("You must choose a file to upload");
        } else {
            //create storage ref
            var storageRef = firebase.storage().ref("resolutions/" + resName.value);

            //upload file
            var uploadTask = storageRef.put(file);

            //handle the file upload
            uploadTask.on('state_changed',

                function progress(snapshot) {},

                function error(err) {
                    alert("An error occurred while uploading file");
                    alert(err.message);
                },

                function complete() {
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
        
        //make sure the default link behaviour doesn't happen
        return false;
    }
}

window.onload = init;