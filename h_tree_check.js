/**
 * ver 2.0
 * Hassan Tree view maker
 * Converts an object to tree. expand and colaple is possible. 
 * Each pranch has a check box to select and deselect sub branche and itselfe
 * 
 * 
 * BY Hassan Bagheri Valoujerdy 2019 JAN 9
 * Hbvsoft.com,bagheri.h@gmail.com
 * For AVA PBX Previlages is faster and more trustable.
 * 
 */ 
(function ($) {
  // Define default values
  var defaults = {
      treeDataSource: 'h-tree-json',
      treeCheckedSource: 'h-tree-selects',
      separator: ":"
  };

  $.fn.h_tree = function (options) {
    // Merge user options with defaults
    var settings = $.extend({}, defaults, options);
    
    // Fetch tree data and checked data
    var treeData = JSON.parse($("#" + settings.treeDataSource).text());
    var treeChecked = JSON.parse($("#" + settings.treeCheckedSource).text());//.split(settings.separator);
    treeChild=addBranch(treeData);
    
    (this).append(treeChild);
    // console.log(treeChecked);
    treeChecked.forEach(function(item){
      $("input[name='treeItems["+item+"]']").prop("checked",true);
      id=$("input[name='treeItems["+item+"]']").attr("id");
      label=$("label[for='"+id+"']");
      console.log("label[for='"+id+"']",item,id,label.attr("class"));
      $("label[for='"+id+"']").removeClass("not-checked");
      $("label[for='"+id+"']").addClass("checked");
      console.log(id);
    });

    mainUl =  $(this).find("ul:first");
    var treeArray = ulToList($(this).find("ul:first")); // Replace with your tree's container selector
    
    treeArray.forEach(function(item){
        var checked = checkItemOnload(item);
    });
    
    // console.log(JSON.stringify(treeArray, null, 2));

  };

  function checkItemOnload(item){
    $("#"+item.label).removeClass("not-checked"); 
    $("#"+item.label).removeClass("semi-checked"); 
    $("#"+item.label).removeClass("checked");
    result=0;
    if(item.items.length > 0 ){
      children = item.items;
      childCount=item.items.length;
      checked=0;
      children.forEach(function(child){
        checked += checkItemOnload(child);
      })
      if(checked==0){
        $("#"+item.label).addClass("not-checked");
        $("#"+item.input_id).prop("checked",false);
        return 0;
      }else if(checked==childCount){
        $("#"+item.label).addClass("checked");
        $("#"+item.input_id).prop("checked",true);
        return 1;
      }else{
        $("#"+item.label).addClass("semi-checked");
        $("#"+item.input_id).prop("checked",true);
        return 2;
      }
    }else{
      if(item.inputChecked){
        $("#"+item.label).addClass("checked");
        result=1;
      }else{
        $("#"+item.label).addClass("not-checked");
        result=0;
      }

    }
    return result;
  }
  // Define the addBranch function
  function addBranch(branches,parentId,parentPath,parentInputId,id,display) {
    id = (typeof(id) ==undefined)?generateRandomUniqueString(10):id;
    var display=(typeof(display) !==undefined)?display:true;
    // console.log("ID: "+id);
           console.log(display);
      var treeUl = $("<ul>",{"class":"h-tree-ul","id":id});
      treeUl.css({"display":(display)?"none":"block"});
      console.log($(treeUl));
      var checkedChildren = 0;
      var childId=0
      
      $.each(branches, function (index, item) {
        if (typeof(item.name) == "undefined"){
          item.name=item.id
        } 
        if (typeof(item.name) !== undefined){
          var path=((typeof(parentPath) !=="undefined")?parentPath+"-":"")+childId;
          var labelId = ((typeof(parentId) !== "undefined")? parentId  + "_":"") + (((typeof(item.id) != "undefined")?item.id:childId));
          var treeLi = $("<li>",{});
          var divCheckBoxGroup=$("<div>",{"class":"checkbox-group"});
          var name = item.name;
          var input_id = name+"_id";
          var checkboxAttr={
            type: "checkbox",
            id: input_id,
            value: 0,
            name:"treeItems["+item.name+"]",
            class: "h_tree_select_input", // Add a CSS class to the checkboxes    
          };
          labelAttr={"for":input_id,
                     "class":"checkbox-label square1 not-checked",
                     "path":path,
                     "text":(typeof(item.text) !=="undefined" )?item.text:"-",
                     id: input_id+"_label"};

          if(typeof(parentInputId)!=="undefined"){
            checkboxAttr.parent_id=parentInputId;
            labelAttr.parent_id = parentInputId+"_label"; 
          }
          var checkbox = $("<input>",checkboxAttr );


          var label=$("<label>",labelAttr);
          divCheckBoxGroup.append(checkbox);
          divCheckBoxGroup.append(label);
          treeLi.append(divCheckBoxGroup);
          if(typeof(item.items) !== "undefined" && item.items.length>0){
              // console.log(item);
              var branch_id = generateRandomUniqueString(10);
              // console.log("branch_id: "+branch_id);
              var expand = (typeof(item.expanded)==undefined || item.expanded )?true:false;
              var child = addBranch(item.items,labelId,path,input_id,branch_id,expand);
              console.log(child);
              if(expand){
                  triangle=$("<span>",{"class":"triangle ","branch_id":branch_id});
                  // treeUl.css({"display":"block"});
              }else{
                  triangle=$("<span>",{"class":"triangle open" ,"branch_id":branch_id});
                  // treeUl.css({"display":"none"});
              }
              divCheckBoxGroup.prepend(triangle);
              treeLi.append(child);
          }
          treeUl.append(treeLi);
          childId++;
        }
      });

      return treeUl;
  }

})(jQuery);


$(document).ready(function () {
  $("label.checkbox-label").on("click",function(){
    if($(this).hasClass("checked")){
      $(this).removeClass("checked");
      $(this).addClass("not-checked");
      CheckChildren(this,0);//chenge all children to not checked
      CheckParent(this);
      return true;
    }else if($(this).hasClass("semi-checked")){
      $(this).removeClass("semi-checked");
      $(this).addClass("checked");
      CheckChildren(this,1);//change all children to checked
      CheckParent(this);
      return false;
    }else{
      $(this).removeClass("not-checked");
      $(this).addClass("checked");
      CheckChildren(this,1);//change all children to checked
      CheckParent(this);
      return true;
    }  
  });

  $(".triangle").on("click", function () {
    // Toggle the visibility of the next UL (sub-branches)
    var parentLi = $(this).closest("li").next("ul.h-tree-ul").toggle();
    console.log($(this).attr("branch_id"));
    // $(this).next("ul.h-tree-ul").toggle();
    $("ul#"+$(this).attr("branch_id")).toggle();
    // Change the triangle icon (up/down) using a class
    $(this).toggleClass("open");
  });
});

function CheckChildren(parentLabel,status){
    children = getCildren(parentLabel);
    classes=Array("not-checked","checked","semi-checked");
    children.forEach(function(label){
      classes.forEach(function(cls){
        $(label).removeClass(cls);
      });
      $(label).addClass(classes[status]);
      var forAttribute = $(label).attr("for");
      $("#" + forAttribute).prop("checked",status);
    }); 
}


function getCildren(object){
  var parentLi = $(object).closest("li");
  siblingUlElements=parentLi.find("> ul:first");
  hasChildren = false;
  var siblingLabelsArray = Array();
  if (siblingUlElements.length > 0) {
      hasChildren = false;
      var siblingLabels = siblingUlElements.find("label.checkbox-label");
      var siblingLabelsArray = siblingLabels.get();
  }
  return siblingLabelsArray;
}

function CheckParent(childLabel){
    var attr=$(childLabel).attr("parent_id");
    if(attr !== undefined){
      forAttribute = $("#"+attr).attr("for");
      // console.log(childLabel);
      if($(childLabel).hasClass("semi-checked")){
        // attr =
        if(!$("#"+attr).hasClass("semi-checked")){ 
          $("#"+attr).removeClass("not-checked"); 
          $("#"+attr).removeClass("checked");
          $("#"+attr).addClass("semi-checked");
          $("#" + forAttribute).prop("checked",1);
        }
      }else{
        children = getCildren($("#"+attr));
        childrenStatus = allChildrenStatus(children);
        if(childrenStatus["childrenCount"] == childrenStatus["checked"]){
          $("#"+attr).removeClass("not-checked"); 
          $("#"+attr).removeClass("semi-checked");
          $("#"+attr).addClass("checked");
          $("#" + forAttribute).prop("checked",1);
        }else if(childrenStatus["checked"] > 0){
          $("#"+attr).removeClass("not-checked"); 
          $("#"+attr).removeClass("checked");
          $("#"+attr).addClass("semi-checked");
          $("#" + forAttribute).prop("checked",1);
        }else{
          $("#"+attr).removeClass("semi-checked"); 
          $("#"+attr).removeClass("checked");
          $("#"+attr).addClass("not-checked");
          $("#" + forAttribute).prop("checked",0);
        }
      } 
      CheckParent($("#"+attr));
    }
}

function allChildrenStatus(children){
    checkedCount=0;
    notCheckedCount=0;
    totalCount=children.length;
    children.forEach(function(label){

        if($(label).hasClass("checked") || $(label).hasClass("semi_checked")){
          checkedCount++;
        }else{
          notCheckedCount++;
        }

    });
    return {"checked":checkedCount,"notChecked":notCheckedCount,"childrenCount":totalCount};
}

function ulToList($ul) {
  var list = [];

  $ul.children('li').each(function () {
    var $li = $(this);
    var $label = $li.children('label');
    // console.log($li);
    var item = {
      label:$li.find("label").attr("id"),
      input_id:$li.find("input").attr("id"),
      inputChecked:$li.find("input").is(":checked"),
      items: []
    };
    var $subUl = $li.children('ul');
    if ($subUl.length) {
      item.items = ulToList($subUl);
    }

    list.push(item);
  });
  return list;
}


function generateRandomUniqueString(length) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  
  // Check if the generated string is already in use (not truly unique, but it helps)
  if (!usedStrings.includes(result)) {
    usedStrings.push(result);
    return result;
  }
  
  // If the string is not unique, recursively generate a new one
  return generateRandomUniqueString(length);
}
var usedStrings=Array();
// const uniqueString=generateRandomUniqueString(10);