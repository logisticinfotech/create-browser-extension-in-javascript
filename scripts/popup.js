// Initialize Firebase
 var config = {
      apiKey: "AIzaSyD630zazwbURuIPs5AnIgElhuxv82zJ7r4",
      authDomain: "extension-237511.firebaseapp.com",
      databaseURL: "https://extension-237511.firebaseio.com",
      projectId: "extension-237511",
      storageBucket: "extension-237511.appspot.com",
      messagingSenderId: "250526445561"
    };
firebase.initializeApp(config);

var syncStatus=false;
var dbRef=firebase.database().ref();
var currentLoginUserId=0;
var personalNoteInput = $("#note-externsion-form").find('#externsion-note-input');
var noteObject=[];

  /////////////////////////////////////////////////////////
  // Listen for auth state changes. 
  /////////////////////////////////////////////////////////
   initApp=function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        syncStatus=true;
        // User is signed in.
        var displayName = user.displayName;
        $("#loginUser").text(displayName);
        $("#loginUser").append(" ");
        var email = user.email;
        currentLoginUserId = user.uid;
        $('#syn-button').text('Logout');
        syncNotes();
      } else {
        // Let's try to get a Google auth token programmatically.
        $('#syn-button').text('Login');
      }
      $('#syn-button').prop('disabled',false);
    });
  }
  /////////////////////////////////////////////////////////
  // Start the auth flow and authorizes to Firebase. 
  //@param{boolean} interactive True if the OAuth flow should request with an interactive mode.
  /////////////////////////////////////////////////////////
  startAuth=function(interactive) {
    // Request an OAuth token from the Chrome Identity API.
    chrome.identity.getAuthToken({interactive: !!interactive}, function(token) {

      if (chrome.runtime.lastError && !interactive) {

        console.log('It was not possible to get a token programmatically.');
      } else if(chrome.runtime.lastError) {

        console.error(chrome.runtime.lastError);
      } else if (token) {

        // Authorize Firebase with the OAuth Access Token.
        var credential = firebase.auth.GoogleAuthProvider.credential(null, token);

        firebase.auth().signInAndRetrieveDataWithCredential(credential).catch(function(error) {
          // The OAuth token might have been invalidated. Lets' remove it from cache.
          
          if (error.code === 'auth/invalid-credential') {
            chrome.identity.removeCachedAuthToken({token: token}, function() {
              startAuth(interactive);
            });
          }

        });
      } else {
        console.error('The OAuth Token was null');
      }
    });
}


 /////////////////////////////////////////////////////////
 //Starts the sign-in process. 
 /////////////////////////////////////////////////////////

$('#syn-button').click(function(){
  $('#syn-button').prop('disabled',true);

  if (firebase.auth().currentUser) {

    firebase.auth().signOut();
    noteObject=[];
    var noteRef = dbRef.child('personal-notes/'+currentLoginUserId); 

    noteRef.on("child_added", snap => {
      var note=snap.val();
      var noteId=snap.key;
      noteObject.push(note);
    }); 
    $("#loginUser").text("Guest");
    $("#loginUser").append(" ");
  } else {
    startAuth(true);
    syncStatus=false;
  }
});

window.onload = function() {
  initApp();
};

/////////////////////////////////////////////////////////
// create single note 
/////////////////////////////////////////////////////////
createNote=function(noteId,note)
{
    // create dynamic li element
    var li = $('<li/>');
    li.prop("class","note");
    li.attr("noteId",noteId);
    li.attr("title","click to edit");

    // create dynamic p element
    var p = $("<p/>");
    p.text(note);
    
    //  create dynamic span element
    var close=$('<span/>');
    close.html("&times;");
    close.prop("class","remove-note");
    close.attr("noteId",noteId);

    //create dynamic a element
    var a = $('<a/>');

    a.append(close);
    a.append(p);

    li.append(a);

    $(".note-box").find("ul").append(li);
    $(".note-loader").addClass('hide');

}

/////////////////////////////////////////////////////////
//get notes and create note 
/////////////////////////////////////////////////////////
createNoteBox=function(){

    $(".note-loader").removeClass('hide');
    $(".note-box").find("ul").empty();
    
    if(syncStatus)
    {
      noteObject=[];
      var noteRef = dbRef.child('personal-notes/'+currentLoginUserId); 
      noteRef.on("child_added", snap => {
        var note=snap.val();
        var noteId=snap.key;
        createNote(noteId,note);
        noteObject.push({[snap.key]:note});
      }); 
      $(".note-loader").addClass('hide');        
    }
    else
    {   
      noteObject=localStorage.getItem('personal-notes');

      if(noteObject)
      {       
        noteObject=JSON.parse(noteObject);      
        $.each(noteObject,function(index,json) { 
           
          for(var noteId in json)
          {
            createNote(noteId,json[noteId]);
          }
        });
        $(".note-loader").addClass('hide');  
      }
      else
      {
        $(".note-loader").addClass('hide'); 
      }
    }
    personalNoteInput.attr("noteId","");
}

if(syncStatus==false)
  createNoteBox();

/////////////////////////////////////////////////////////
//upload note to server and save note to local storage 
/////////////////////////////////////////////////////////

syncNotes=function()
{
  var personal_note=localStorage.getItem('personal-notes');
    var noteLocalObject=[];
    if(personal_note!="")
    {
      noteLocalObject=JSON.parse(personal_note);  
      if($.isEmptyObject(noteLocalObject))
        noteLocalObject=[];
    } 
    if(!$.isEmptyObject(noteLocalObject))
    {

      noteRef=dbRef.child('personal-notes/'+currentLoginUserId);
      $.each(noteLocalObject,function(index,item){
        for(var noteId in item)
        {
          if(parseInt(noteId)>=0)
          {
            var noteId=noteRef.push(item[noteId], function(response){
              }).key;
            noteObject.push({[noteId]:personalNoteInput.val()});  
          }
        }
      });
    } 

    var noteRef = dbRef.child('personal-notes/'+currentLoginUserId); 
    jsonString="";
    localStorage.setItem('personal-notes',[]);

    noteRef.on("child_added", snap => {
      var single_note={[snap.key]:snap.val()};
      jsonString=localStorage.getItem('personal-notes');
      jsonString=jsonString?JSON.parse(jsonString):[];  
      jsonString.push(single_note);
      localStorage.setItem('personal-notes',JSON.stringify(jsonString));  
    }); 
    createNoteBox();
}

/////////////////////////////////////////////////////////
//start save note 
/////////////////////////////////////////////////////////

$("#note-externsion-form").submit(function (e) {
    e.preventDefault();
    if(personalNoteInput.val()!=="")
    {
      if(syncStatus)
      {
          var noteId=personalNoteInput.attr("noteId");
          if(noteId!="" && typeof noteId!==undefined)
          {
            var updateNoteRef = dbRef.child('personal-notes/'+currentLoginUserId+'/'+noteId);
            updateNoteRef.set(personalNoteInput.val(), function(){

            });
            personalNoteInput.attr("noteId","");
            // callback();
            createNoteBox();
          }
          else
          {
            noteRef=dbRef.child('personal-notes/'+currentLoginUserId);
            var noteId=noteRef.push(personalNoteInput.val(), function(response){
            }).key;
            noteObject.push({[noteId]:personalNoteInput.val()});
          
            createNoteBox();
          }
      }
      else
      {
          var noteId=personalNoteInput.attr("noteId");
          if(noteId!="" && typeof noteObject[noteId]!=="undefined")
          {
             console.log("console if");
            tempObject=[];
             noteObject.filter(function(json,index) {     
              if(json[noteId])
                 tempObject.push({[noteId]:personalNoteInput.val()});
              else
                tempObject.push(json);
            });
            noteObject=tempObject;
            localStorage.setItem("personal-notes",JSON.stringify(tempObject));
            personalNoteInput.attr("noteId","");
            createNoteBox();
          }
          else
          {
            
            if($.isEmptyObject(noteObject))
            {
              noteId="0";
              noteObject=[];
            }
            else
            {
              noteId=Object.keys(noteObject).length;
            }
            noteObject.push({[noteId]:personalNoteInput.val()});
        
            localStorage.setItem("personal-notes",JSON.stringify(noteObject));
            createNoteBox();
          }
      }
      
      personalNoteInput.val("");
    }
});
/////////////////////////////////////////////////////////
// end save note 
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// start edit note //
/////////////////////////////////////////////////////////

$(".note-box>ul").on("click",".note:not(.remove-note)",function(){
  var noteId=$(this).attr('noteId');
  if(syncStatus)
  {
    var editNoteRef = dbRef.child('personal-notes/'+currentLoginUserId+'/'+noteId);
    editNoteRef.on("value", snap => {
      personalNoteInput.val(snap.val());
    });
  }
  else
  {
    var tempObject=noteObject.filter(function(json) {     
        for(var key in json)
        {
          if(key==noteId)
          {
            personalNoteInput.val(json[noteId]);
            break;
          }
        }
    });
  }
  personalNoteInput.attr("noteId",noteId);
});

/////////////////////////////////////////////////////////
// end edit note 
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// start remove specific note 
/////////////////////////////////////////////////////////
$('.note-box').on("click",".remove-note",function(){
  
  var noteId=$(this).attr('noteId');
  if(syncStatus)
  {
    var noteRef = dbRef.child('personal-notes/'+currentLoginUserId+'/'+noteId);
    noteRef.remove();
  }
  
  var tempObject=noteObject.filter(function(json) {     
      for(var key in json)
      {
        return key!==noteId;
      }
  });

  noteObject=tempObject;
  if(noteObject && (typeof noteObject=='object' && noteObject.length))
  {
    localStorage.setItem("personal-notes",JSON.stringify(noteObject));
    syncNotes();
  }
  else
  {
    noteObject=[];
    localStorage.setItem("personal-notes","[]");
    createNoteBox();
  }
  
  personalNoteInput.val("");
  personalNoteInput.attr("noteId","");
});


/////////////////////////////////////////////////////////
// end remove specific note 
/////////////////////////////////////////////////////////
