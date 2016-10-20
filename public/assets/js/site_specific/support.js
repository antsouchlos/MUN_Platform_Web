var fired = false;

function reset() {
	d_t = document.getElementById("d_t_elem").value = "";
	name = document.getElementById("name_elem").value = "";
	email = document.getElementById("email_elem").value = "";
	topic = document.getElementById("topic_elem").value = "";
	message = document.getElementById("message_elem").value = "";
}

function check() {
	var list = document.getElementById("messages_elem");
	var selectedIndex = list.selectedIndex;
	
	if (selectedIndex != -1) {
		var id = parseInt(list.options[selectedIndex].text);
		
		var d_t = document.getElementById("d_t_elem");
		var name = document.getElementById("name_elem");
		var email = document.getElementById("email_elem");
		var topic = document.getElementById("topic_elem");
		var message = document.getElementById("message_elem");
		
		firebase.database().ref().child("messages").child(id.toString()).child("d_t").once("value", function(snapshot) {
			d_t.innerHTML = snapshot.val();
		});
		
		firebase.database().ref().child("messages").child(id.toString()).child("name").once("value", function(snapshot) {
			name.innerHTML = snapshot.val();
		});
		
		firebase.database().ref().child("messages").child(id.toString()).child("email").once("value", function(snapshot) {
			email.innerHTML = snapshot.val();
		});
		
		firebase.database().ref().child("messages").child(id.toString()).child("topic").once("value", function(snapshot) {
			topic.innerHTML = "I want to " + snapshot.val();
		});
		
		firebase.database().ref().child("messages").child(id.toString()).child("message").once("value", function(snapshot) {
			message.value = snapshot.val();
		});
	} else {
		alert("You must choose a message to view");
	}
}

function addChild(id) {
	var option = document.createElement("option");
	option.text = id;
	document.getElementById("messages_elem").add(option);
}

function listen() {
	firebase.database().ref().child("messages").on("child_added", function(snapshot) {
		var id = parseInt(snapshot.key);
		
		addChild(id);
		
		if (!fired) {
			document.getElementById("messages_elem").selectedIndex = 0;
			check();
		}
	});
}

function init() {
	document.getElementById("message_elem").readOnly = true;
	
	reset();
	
	listen();
}

window.onload = init;
