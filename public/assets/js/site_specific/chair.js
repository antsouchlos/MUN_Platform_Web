//global variables
var resList_ids = [];

var notRegistered = 0;
var prevID = 0;
var currentCommittee = null;
var uploading = false;

//gets called when the selected element of the "chek" select box changes
function check() {
	document.getElementById("uploaded_txt").innerHTML = "";
	document.getElementById("archived_txt").innerHTML = "";
	document.getElementById("approval_txt").innerHTML = "";
	document.getElementById("aNumber_txt").innerHTML = "";
	document.getElementById("debate_txt").innerHTML = "";
	document.getElementById("GA_txt").innerHTML = "";
	
    var resList = document.getElementById("resList");

    if (resList.selectedIndex != -1) {
    	var id = resList_ids[resList.selectedIndex];
    	
        var metaReference = firebase.database().ref().child("metadata").child(id);
        
        var uploadedRef = metaReference.child("uploaded");
        var registeredRef = metaReference.child("registered");
        var aPanelRef = metaReference.child("aPanel");
        var aNumberRef = metaReference.child("aNumber");
        var debateRef = metaReference.child("debate");
        var gaRef = metaReference.child("ga");
        
        
        //detach previous listeners
        firebase.database().ref().child("metadata").child(prevID).child("id").off();
        firebase.database().ref().child("metadata").child(prevID).child("uploaded").off();
        firebase.database().ref().child("metadata").child(prevID).child("registered").off();
        firebase.database().ref().child("metadata").child(prevID).child("aPanel").off();
        firebase.database().ref().child("metadata").child(prevID).child("aNumber").off();
        firebase.database().ref().child("metadata").child(prevID).child("ga").off();
        
        //ID
        firebase.database().ref().child("metadata").child(id).child("id").on("value", function (snapshot) {
        	if (snapshot.exists()) {
            	document.getElementById("id_txt").innerHTML = snapshot.val().toString();
            	firebase.database().ref().child("metadata").child(id).child("id").off();
        	} else 
        		document.getElementById("id_txt").innerHTML = "pending";
        });
        
        //upload time
        uploadedRef.on("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("uploaded_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("uploaded_txt").innerHTML = "pending";
        });
        
        //archived time
        registeredRef.on("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("archived_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("archived_txt").innerHTML = "pending";

        });
        
        //approval time
        aPanelRef.on("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("approval_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("approval_txt").innerHTML = "pending";
        });
        
        //aNumber time
        aNumberRef.on("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("aNumber_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("aNumber_txt").innerHTML = "pending";
        });
        
        //debate status
        debateRef.on("value", function(snapshot) {
        	if (snapshot.exists())
        		document.getElementById("debate_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("debate_txt").innerHTML = "pending";
        });
        
        //ga status
        gaRef.on("value", function(snapshot) {
        	if (snapshot.exists())
        		document.getElementById("GA_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("GA_txt").innerHTML = "pending";
        });
        
        prevID = id;
    } else {
        //alert("You must choose a resolution to check");
    }
}

function addChild(originalId, name, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    
    if (id == -1) {
    	item.text += "ID [not registered]";
    	notRegistered++;
    	id = 1 - notRegistered;
    } else
    	item.text += "ID " + id.toString();
    
    item.text +=  name;
    list.add(item, id -1 + notRegistered);
    
    if (listName == "resList")
    	resList_ids.splice(id -1 + notRegistered, 0, originalId);
    	
}

function changeChild(name, index, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");

    if (id == -1) {
    	item.text += "ID [not registered]";
		id = 1 - notRegistered + index;
    } else {
    	item.text += "ID " + id.toString();
    	notRegistered--;
    }
    	
    item.text += " " + name;

    list.remove(index);
    list.add(item, id -1 + notRegistered);

    if (listName = "resList") {
    	//backup the item's value
    	var originalId = resList_ids[index];
    	
    	//remove the item from the list
    	resList_ids.splice(index, 1);
    	
    	//insert the item in the new position
    	resList_ids.splice(id -1 + notRegistered, 0, originalId);
    }
}

function removeChild(index, listName) {
	document.getElementById(listName).remove(index);
}

//listen for changes to the children of "reference" and update "resList" accordingly
function listen(reference, topic, listName) {
    //add an item to list when a child is added to the database
    reference.on("child_added", function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child("metadata").child(parseInt(childSnapshot.key)).child("id").once("value", function(snapshot) {
        	if (snapshot.exists())
        		id = snapshot.val();
        	
            addChild(parseInt(childSnapshot.key), ": " + topic + '/' + childSnapshot.val(), id, listName);
            
            check();
            
            //attach a listener, so that the id gets updated in realtime if the resolution gets registered
            if (id == -1) {
            	firebase.database().ref().child("metadata").child(parseInt(childSnapshot.key)).child("id").on("value", function (innerSnapshot) {
            		if (innerSnapshot.val() != null)
            			changeChild(": " + topic + '/' + childSnapshot.val(), resList_ids.indexOf(parseInt(childSnapshot.key)), innerSnapshot.val(), "resList")
            	});
            }
        });
    });
}

function debateListen(listName) {
	firebase.database().ref().child("A_Number").on("child_added", function(snapshot) {
		firebase.database().ref().child("committees").child(snapshot.val()).once("value", function(innerSnapshot) {
			if (innerSnapshot.val() == currentCommittee) {
				addChild(snapshot.val(), "", parseInt(snapshot.key), listName);	
			}
		});
	});
	
	var n = 0;
	
	firebase.database().ref().child("A_Number").on("child_removed", function(snapshot) {
			var list = document.getElementById(listName).options;
			var optionList = [];
			
			for (i = 0; i < list.length; i++)
				optionList.push(list[i].value);
			
			removeChild(optionList.indexOf("ID " + parseInt(snapshot.key)), listName);
	});
};

function aNumDownloadListen(listName) {
	firebase.database().ref().child("A_Number_Download").on("child_added", function(snapshot) {
		firebase.database().ref().child("committees").child(snapshot.val()).once("value", function(innerSnapshot) {
			if (innerSnapshot.val() == currentCommittee) {
				addChild(snapshot.val(), "", parseInt(snapshot.key), listName);	
			}
		});
	});
}

function gaStatusListen(listName) {
    firebase.database().ref().child("debate").on("child_added", function (snapshot) {
    	firebase.database().ref().child("metadata").child(snapshot.val()).child("debate").once("value", function(innerSnapshot) {
    		if (innerSnapshot.val() == "passed") {
    			firebase.database().ref().child("committees").child(snapshot.val()).once("value", function(innerSnapshot2) {
    				if (innerSnapshot2.val() == currentCommittee)
    					addChild(snapshot.val(), "", parseInt(snapshot.key), listName);	
    			});
    		}
    	});
    });
    
    firebase.database().ref().child("debate").on("child_removed", function (snapshot) {
		var list = document.getElementById(listName).options;
		var optionList = [];
		
		for (i = 0; i < list.length; i++)
			optionList.push(list[i].value);
		
		removeChild(optionList.indexOf("ID " + parseInt(snapshot.key)), listName);
    });
}

function gaDownloadListen(listName) {
	firebase.database().ref().child("ga").on("child_added", function(snapshot) {
		firebase.database().ref().child("metadata").child(snapshot.val()).child("ga").once("value", function(innerSnapshot) {
			if (innerSnapshot.val() == "approved") {
    			firebase.database().ref().child("committees").child(snapshot.val()).once("value", function(innerSnapshot2) {
    				if (innerSnapshot2.val() == currentCommittee)
    					addChild(snapshot.val(), "", parseInt(snapshot.key), listName);	
    			});
			}
		});
	});
}

function startListeners(committee) {	
    const resolutionRef = firebase.database().ref().child("resolutions").child(committee);
    
    var index = committee_array.indexOf(committee);
    var topics = allTopics[index];
    
    for (i = 0; i < topics.length; i++)
    	listen(resolutionRef.child(topics[i]), topics[i], "resList");
	
    debateListen("resList2");
    
    aNumDownloadListen("AnumList");
    
    gaStatusListen("resList3");
    
    gaDownloadListen("GaList");
}

function init() {
    var fired = false;
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (!fired) {
            fired = true;
            
            var studentOfficer = "Student officer";
            var email = firebaseUser.email;
            var list = document.getElementById("topicView");
            
            if (email == "political@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Special Political and Decolonization Committee";
                
                for (i = 0; i < poliTopics.length; i++) {
                	var option = document.createElement("option");
                	option.text = poliTopics[i];
                	list.add(option);
                }
                
                currentCommittee = "political";
                
            } else if (email == "disarmament@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Disarmament and International Security Commitee";
                
                for (i = 0; i < disaTopics.length; i++) {
                	var option = document.createElement("option");
                	option.text = disaTopics[i];
                	list.add(option);
                }
                
                currentCommittee = "disarmament";
                
            } else if (email == "humanitarian@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Social, Humanitarian and Cultural Committee";
                
                for (i = 0; i < humaTopics.length; i++) {
                	var option = document.createElement("option");
                	option.text = humaTopics[i];
                	list.add(option);
                }
                
                currentCommittee = "humanitarian";
                
            } else if (email == "environmental@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Environmental Committee";
                
                for (i = 0; i < enviTopics.length; i++) {
                	var option = document.createElement("option");
                	option.text = enviTopics[i];
                	list.add(option);
                }
                
                currentCommittee = "environmental";
            }
        	
            //listen for resolution uploads
            startListeners(currentCommittee);
        }
    });
    
    //logout
    document.getElementById("logout_link").onclick = function() {
    	firebase.auth().signOut();
    	document.location.href = "index.html";
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
}

window.onload = init;
