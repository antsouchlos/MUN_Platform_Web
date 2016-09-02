function addChild(name, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    item.text = "Resolution " + id + ": " + name;
    list.add(item);
}

function changeChild(name, index, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    item.text = "Resolution " + (index+1) + ": " + name;

    list.remove(index);
    list.add(item, index);
}

function removeChild(index, listName) {
    var list = document.getElementById(listName);
    list.remove(index);
}

//listen for changes to the children of "reference" and update "resList" accordingly
function listen(reference, topic, listName) {
    //add an item to list when a child is added to the database
    reference.on('child_added', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";

        addChild(topic + '/' + childSnapshot.val(), parseInt(prevChildKey) + 1, listName);
    });

    //change an item's text when the value of the corresponding child is changed in the database
    reference.on('child_changed', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";

        changeChild(topic + '/' + childSnapshot.val(), parseInt(prevChildKey), listName);
    });

    //remove an item when the corresponding child is removed from the database
    reference.on('child_removed', function(oldChildSnapshot) {
        removeChild(parseInt(oldChildSnapshot.key-1), listName);
    });
}

function init() {
    var currentCommittee = "null";
    
    //set the title and subtitle of the site
    //TODO: set studen officers and remove this variable
    studentOfficer = "[tbd] - Student officer";
    
    var fired = false;
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (!fired) {
            fired = true;

            var email = firebaseUser.email;

            if (email == "political@dsamun.com") {
                //TODO: set student officer
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Special Political and Decolonization Committee";
                currentCommittee = "political";
            } else if (email == "disarmament@dsamun.com") {
                //TODO: set student officer
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Disarmament and International Security Commitee";
                currentCommittee = "disarmament";
            } else if (email == "humanitarian@dsamun.com") {
                //TODO: set student officer
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Social, Humanitarian and Cultural Committee";
                currentCommittee = "humanitarian";
            } else if (email == "environmental@dsamun.com") {
                //TODO: set student officer
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Environmental Committee";
                currentCommittee = "environmental";
            }
        }
        
        const resolutionRef = firebase.database().ref().child('resolutions').child(currentCommittee);
    
        listen(resolutionRef.child("topic 1"), "topic 1", "resList");
        listen(resolutionRef.child("topic 2"), "topic 2", "resList");
        listen(resolutionRef.child("topic 3"), "topic 3", "resList");
        listen(resolutionRef.child("topic 4"), "topic 4", "resList");
        
        listen(resolutionRef.child("topic 1"), "topic 1", "resList2");
        listen(resolutionRef.child("topic 2"), "topic 2", "resList2");
        listen(resolutionRef.child("topic 3"), "topic 3", "resList2");
        listen(resolutionRef.child("topic 4"), "topic 4", "resList2");
    });
    
    //hide the msg_text message
    document.getElementById("msg_text").style.visibility = "hidden";
    
    var fileChooser = document.getElementById("fileChooser");
    var resName = document.getElementById("resName");
    var topicView = document.getElementById("topicView");

    var file = null;
    
    //set listener on the filechooser
    fileChooser.addEventListener('change', function(e) {
        //get file
        file = e.target.files[0];
    });
                                 
    //add listener to the "upload" button
    var upload_link = document.getElementById("upload_link");
    upload_link.onclick = function() {
        if (currentCommittee != "null") {
            //hide the successfule_text message
            document.getElementById("msg_text").style.visibility = "hidden";

            if (resName.value == "") {
                alert("You must choose a name for the resolution");
            } else if (file == null) {
                alert("You must choose a file to upload");
            } else if (topicView.selectedIndex == -1 || topicView.options[topicView.selectedIndex].text == "- Topic -") {
                alert("You must choose a topic");
            } else {
                //Get the selected topic
                var topic = topicView.options[topicView.selectedIndex].text;

                var storageRef = firebase.storage().ref("resolutions/" + currentCommittee + "/" + topic + "/" + resName.value);

                //upload file
                var uploadTask = storageRef.put(file);

                //handle the file upload
                uploadTask.on('state_changed',

                    function progress(snapshot) {},

                    function error(err) {
                        alert("An error occurred while uploading the file");
                    },

                    function complete() {
                        //make the msg_text message visible
                        document.getElementById("msg_text").style.visibility = "visible";

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
                                var databaseRef = firebase.database().ref().child('resolutions').child(currentCommittee).child(topic).child(counter.toString());

                                //set the name of the new resolution
                                databaseRef.set(resName.value);

                                //update the counter
                                counterRef.set(counter.toString());
                            }
                        });
                    }
                );
            }
        } else {
            alert("An error occurred while uploading resolution");
        }
        
        //make sure the default link behaviour doesn't happen
        return false;
    }
}

window.onload = init;