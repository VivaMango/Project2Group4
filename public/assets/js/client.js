var importedPlayerArray = []
var teamOneArray = []
var teamTwoArray = []
var grids = []

//GAME START
$(document).ready(function() {
  teamOneArray.length = 0
  teamTwoArray.length = 0
  importedPlayerArray.length = 0
  getPlayers().then(function(data) {
    data.forEach(function(element) {
      makePlayers(element);
    })
    importedPlayerArray.forEach(function(element) {
      makeNewItem(element);
    })
    runMuuri();
    newBoardGrid();
    $("#loadModal").modal("show");
  });



  $('#loadModal').on('hidden.bs.modal', function (event) {
    playGame();
  })

  $('#endModal').on('hidden.bs.modal', function (event) {
    location.reload(true)
  })
})




//RUNNING CODE ABOVE
//FUNCTION DEFINITIONS BELOW

//function to run on modal close to check gamestate recursively
function playGame() {
  if (teamOneArray.length === 0) {
    columnDragListen(0);
    columnDragListen(2);
    firstPick(playGame);
  } else if (teamTwoArray.length < 5) {
    nextPick(playGame);
    // playGame();
  } else if (teamTwoArray.length = 5) {
    pickWinner(teamOneArray , teamTwoArray);
    console.log("Draft Complete")
  }
}

function columnDragListen(columnNum) {
  columnGrids[columnNum].on("dragReleaseEnd" , function (item) {
    var gotElement = item.getElement()
   elementAttr = $(gotElement).attr("itemdata")
   var draftedPlayerObject = importedPlayerArray.find(function(element) {
     return element.name === elementAttr
   })
   playGame();
  } )
}


//Function designed to recursively be called to start our game.
function firstPick(pGfn) {
 //TODO Fill span with Team A Pick text, wait for TeamOneArray.length = 1?
 $("#pickText").html("Team A")
 $("#pickText").attr("picktext" , "A")
}

//Function to iterate picks after the first
function nextPick(pGfn) {
 var pickText = $("#pickText").attr("picktext")
 if (pickText === "A") {
  $("#pickText").html("Team B")
  $("#pickText").attr("picktext" , "B")
 } else if (pickText === "B") {
  $("#pickText").html("Team A")
  $("#pickText").attr("picktext" , "A")
 }
}

function pickWinner(arrayOne , arrayTwo) {
  //TODO use arrays to determine winning team
  let onePoints = 0
  let twoPoints = 0
  arrayOne.forEach(function(element) {
    var elPoints = parseInt(element.points)
    onePoints += elPoints
  })
  arrayTwo.forEach(function(element) {
    var elPoints = parseInt(element.points)
    twoPoints += elPoints
  })
  if (onePoints > twoPoints) {
    $("#gameWinner").html("Team A")
    $("#endModal").modal("show");
  } else if (twoPoints > onePoints) {
    $("#gameWinner").html("Team B")
    $("#endModal").modal("show");
  } else if (onePoints = twoPoints) {
    $("#gameWinner").html("It's A TIE?! NO OT TONIGHT!")
    $("#endModal").modal("show");
  }

  

  //TODO display winnerModal
}

//Function to update a drafted player for Team One UNNECESSARY, DATA DOESNT NEED TO BE UPDATED IN DATABASE DURING GAMEPLAY
function teamOneDraft(draftedPlayer) {
    $.ajax({
      method: "PUT",
      url: `/api/tokyo_draft/teamone/${draftedPlayer.Id}`,
      data: draftedPlayer
    }).then(getPlayers);
}

//Function to update a drafted player for Team Two UNNECESSARY, DATA DOESNT NEED TO BE UPDATED IN DATABASE DURING GAMEPLAY
function teamTwoDraft(draftedPlayer) {
    $.ajax({
      method: "PUT",
      url: `/api/tokyo_draft/teamtwo/${draftedPlayer.Id}`,
      data: draftedPlayer
    }).then(getPlayers);
}


function createPlayer(createdPlayer) {
  //Unnecessary for 1.0
}

//Function to get all players from database
function getPlayers() {
   return $.get("/api/tokyo_draft" , function(data) { return data })
}

//Constructor that takes a single Row array from Sequelize and turns it into a format we want.
//TODO Add ID to constructor/Player Objects
function Player(name, teamName, points, drafted, draftedTeam, photoURL) {
  this.name = name;
  this.teamName = teamName,
  this.points = points;
  this.drafted = drafted;
  this.draftedTeam = draftedTeam;
  this.photoURL = photoURL;
}

//Function iterating our getPlayers response and making a variable for each.
//TODO add ID
function makePlayers(rowData) {
    var newPlayer = new Player (rowData.name , rowData.teamName , rowData.points , rowData.drafted , rowData.draftedTeam , rowData.photoURL)
    importedPlayerArray.push(newPlayer)
};

//TODO add line break between name and points, maybe add team name to cards if possible
function makeNewItem(PlayerObject) {
  var newBoardItem = $("<div>")
  newBoardItem.attr("itemData" , `${PlayerObject.name}`)
  newBoardItem.addClass("board-item")
  var newBoardItemContent = $("<div>")
  newBoardItemContent.addClass("board-item-content")
  var newImageSpan = $("<span>")
  var newImg = $("<img>")
  newImg.attr("src" , PlayerObject.photoURL)
  newImageSpan.append(newImg)
  var newTextSpan = $("<span>")
  newSpanTextString = PlayerObject.name
  newTextSpan.append(newSpanTextString)
  var newPointsSpan = $("<span>")
  newSpanPointsString = PlayerObject.points
  newPointsSpan.append(newSpanPointsString)
  newBoardItemContent.append(newImageSpan)
  newBoardItemContent.append(newTextSpan)
  newBoardItemContent.append(newPointsSpan)
  newBoardItem.append(newBoardItemContent)
  $("#chooseTeamBoard").append(newBoardItem)
}



//MUURI STUFF
var itemContainers = [].slice.call(document.querySelectorAll('.board-column-content'));
var columnGrids = [];
var boardGrid;

function runMuuri() {
itemContainers.forEach(function (container) {

  var grid = new Muuri(container, {
    items: '.board-item',
    layoutDuration: 400,
    layoutEasing: 'ease',
    dragEnabled: true,
    dragSort: function () {
      return columnGrids;
    },
    dragSortInterval: 0,
    dragContainer: document.body,
    dragReleaseDuration: 400,
    dragReleaseEasing: 'ease'
  })
  .on('dragStart', function (item) {
    item.getElement().style.width = item.getWidth() + 'px';
    item.getElement().style.height = item.getHeight() + 'px';
  })
  .on('dragReleaseEnd', function (item) {
    item.getElement().style.width = '';
    item.getElement().style.height = '';
    columnGrids.forEach(function (grid) {
      grid.refreshItems();
    });
    var draggedItem = item.getElement();
    var draggedData = $(draggedItem).attr("itemData")
    var draggedParent = $(draggedItem).parent().parent();
    draggedDaddy = draggedParent[0]
    var draggedBoardClass = draggedDaddy.className
    switch (draggedBoardClass) {
      //TEAM 1 OR LEFT SIDE
      case "board-column todo muuri-item muuri-item-shown": 
      var movedPlayerItem = importedPlayerArray.find(function(element) {
        return element.name === draggedData
      })
      movedPlayerItem.draftedTeam = 1
      teamOneArray.push(movedPlayerItem)
        break;
      //TEAM 2 OR RIGHT SIDE
      case "board-column done muuri-item muuri-item-shown":
      var movedPlayerItem = importedPlayerArray.find(function(element) {
        return element.name === draggedData
      })
      movedPlayerItem.draftedTeam = 2
      teamTwoArray.push(movedPlayerItem)
        break;
      //MIDDLE UNSELECTED
      case "board-column working muuri-item muuri-item-shown":
        //TODO error message when player is not dragged to team A or B, If statement checking movedPlayerItem.draftedTeam for val
        break;
      default:
        //TODO figure out what default would be, might be unnecessary.
        break;
    }
  })
  .on('layoutStart', function () {
    boardGrid.refreshItems().layout();
  });

  // THIS WAS GOOD
  columnGrids.push(grid);

});
}

function newBoardGrid() {
  boardGrid = new Muuri('.board', {
    layoutDuration: 400,
    layoutEasing: 'ease',
    dragEnabled: true,
    dragSortInterval: 0,
    dragStartPredicate: {
      handle: '.board-column-header'
    },
    dragReleaseDuration: 400,
    dragReleaseEasing: 'ease'
  });


  return boardGrid;
};