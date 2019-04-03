$(function(){
  
  var input = $("#note-externsion-form").find('#externsion-note-input')
    var externsionNotes=[];

    // get note
    getNotes=function(){
      return localStorage.getItem('items')?JSON.parse(localStorage.getItem('items')):[];
    }

    // set note
    setNotes=function(data)
    {
      return localStorage.setItem('items', JSON.stringify(data));
    }

  // create note box
  createNoteBox=function(data){

      $(".note-box").find("ul").empty();

      data.forEach(function(item,index){
        
    // create dynamic li element
        var li = $('<li/>');
        li.prop("class","note");
        li.attr("note_id",index);
        li.attr("title","click to edit");

        // create dynamic p element
        var p = $("<p/>");
        p.text(item);
        
        //  create dynamic span element
        var close=$('<span/>');
        close.html("&times;");
        close.prop("class","remove-note");
        close.attr("note_id",index);

        //create dynamic a element
        var a = $('<a/>');

        a.append(close);
        a.append(p);

        li.append(a);

        $(".note-box").find("ul").append(li);
    });

      input.attr("note_id","");
    }
    externsionNotes=getNotes();
    createNoteBox(externsionNotes);

    // save note
  $("#note-externsion-form").submit(function (e) {
      e.preventDefault();
      
      externsionNotes=getNotes();

      if(input.val()!=="")
      {
           var index=input.attr("note_id");
              
         if(index!="" && index!==undefined)
         {
            externsionNotes[index]=input.val();
            setNotes(externsionNotes);
            input.attr("note_id","");
            createNoteBox(externsionNotes);
        }
        else
        {
          externsionNotes.push(input.val());
          setNotes(externsionNotes);
          createNoteBox(externsionNotes);
        }
        
        input.val("");
      }
    });

 // delete all note
  $(".note-externsion-clear-all").click(function () {
      localStorage.clear();
      setNotes([]);
      createNoteBox([]);
  });


  // remove specific note
  $('.note-box').on("click",".remove-note",function(){
    
    var index=$(this).attr('note_id');
    externsionNotes=getNotes();

    delete externsionNotes[index];
    var filtered = externsionNotes.filter(function (el) {
      return el !== "" && el !== null;
    });

    setNotes(filtered);
    createNoteBox(filtered);
    input.val("");
    input.attr("note_id","");
  });

  // edit note
  $(".note-box>ul").on("click",".note:not(.remove-note)",function(){
      var index=$(this).attr('note_id');
      data = getNotes();
      input.val(data[index]);
      input.attr("note_id",index);
  });
});