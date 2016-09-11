//takes the the text of a select-option as an argument and returns only the relevant part for download (only the resolution name and topic - without the id)
function getRelevant(itemValue) {
    var result = "";

    var writing = false;

    for (i = 0; i < itemValue.length; i++) {
        if (!writing) {
            if (itemValue.charAt(i) == ':') {
                i++;
                writing = true;
            }
        } else {
            result += itemValue.charAt(i);
        }
    }

    return result;
}

//extract just the committee of a string of the form: "[committee]/[topic]/[name]"
function getCommittee(txt) {
    var result= "";
    
    for (i = 0; i < txt.length; i++) {
        if (txt.charAt(i) == '/')
            break;
        
        result += txt.charAt(i);
    }
    
    return result;
}

//extract just the name of a string of the form: "[committee]/[topic]/[name]"
function getName(txt) {
    var result= "";
    
    var writing = 0;
    
    for (i = 0; i < txt.length; i++) {
        if (writing < 2) {
            if (txt.charAt(i) == '/')
                writing++;
        } else {
            result += txt.charAt(i);
        }
    }
    
    return result;
}

//extract just the topic of a string of the form: "[committee]/[topic]/[name]"
function getTopic(txt) {
    var result= "";
    
    var writing = false;
    
    for (i = 0; i < txt.length; i++) {
        if (!writing) {
            if (txt.charAt(i) == '/')
                writing = true;
        } else {
        	if (txt.charAt(i) == '/')
        		break;
            result += txt.charAt(i);
        }
    }
    
    return result;
}

//takes the value of a select-option (form: "Resolution [id]: [topic]/[name]") as an argument and returns the id
function getId(txt) {
    var result = "";
    
   	var writing = false;
    
    for (i = 0; i < txt.length; i++) {
        if (!writing) {
            if (txt.charAt(i) == ' ')
                writing = true;
        } else {
            if (txt.charAt(i) == ':')
                break;
            else
                result += txt.charAt(i);
        }
    }

    return parseInt(result);
}
