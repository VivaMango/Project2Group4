// INIT ARRAYS
var importedPlayerArray = [];
var teamOneArray = [];
var teamTwoArray = [];
var grids = [];

//GAME START ON PAGE LOAD
$(document).ready(function() {
  teamOneArray.length = 0;
  teamTwoArray.length = 0;
  importedPlayerArray.length = 0;
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
  });

  $('#endModal').on('hidden.bs.modal', function (event) {
    location.reload(true);
  });
})

//RUNNING CODE ABOVE
//FUNCTION DEFINITIONS BELOW

//CORE GAME FUNCTION
function playGame() {
  if (teamOneArray.length === 0) {
    columnDragListen(0);
    columnDragListen(2);
    firstPick();
  } else if (teamTwoArray.length < 5) {
    nextPick();
  } else if (teamTwoArray.length = 5) {
    pickWinner(teamOneArray , teamTwoArray);
    console.log("Draft Complete")
  }
};

//ATTACHES DRAG RELEASE EVENT LISTENER TO MUURI COLUMNS
function columnDragListen(columnNum) {
  columnGrids[columnNum].on("dragReleaseEnd" , function (item) {
    var gotElement = item.getElement()
    elementAttr = $(gotElement).attr("itemdata")
    var draftedPlayerObject = importedPlayerArray.find(function(element) {
      return element.name === elementAttr
    })
    playGame();
  } )
};


//STARTS OUR PICK STATE
function firstPick() {
  $("#pickText").html("Team A")
  $("#pickText").attr("picktext" , "A")
};

//ITERATING OUR PICK STATE
function nextPick() {
  var pickText = $("#pickText").attr("picktext")
  if (pickText === "A") {
    $("#pickText").html("Team B")
    $("#pickText").attr("picktext" , "B")
 } else if (pickText === "B") {
    $("#pickText").html("Team A")
    $("#pickText").attr("picktext" , "A")
  }
};

//PICKS A WINNER ONCE OUR ARRAYS ARE FILLED
function pickWinner(arrayOne , arrayTwo) {
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
};

//Function to update a drafted player for Team One UNNECESSARY, DATA DOESNT NEED TO BE UPDATED IN DATABASE DURING GAMEPLAY
function teamOneDraft(draftedPlayer) {
    $.ajax({
      method: "PUT",
      url: `/api/tokyo_draft/teamone/${draftedPlayer.Id}`,
      data: draftedPlayer
    }).then(getPlayers);
};

//Function to update a drafted player for Team Two UNNECESSARY, DATA DOESNT NEED TO BE UPDATED IN DATABASE DURING GAMEPLAY
function teamTwoDraft(draftedPlayer) {
    $.ajax({
      method: "PUT",
      url: `/api/tokyo_draft/teamtwo/${draftedPlayer.Id}`,
      data: draftedPlayer
    }).then(getPlayers);
};

//UNNECESSARY FOR 1.0
function createPlayer(createdPlayer) {
  //Unnecessary for 1.0
};

//GETS ALL PLAYERS FROM DATABASE
function getPlayers() {
  return $.get("/api/tokyo_draft" , function(data) { return data })
};

//CONSTRUCTOR FOR PLAYER OBJECTS
//TODO Add ID to constructor/Player Objects
function Player(name, teamName, points, drafted, draftedTeam, photoURL) {
  this.name = name;
  this.teamName = teamName,
  this.points = points;
  this.drafted = drafted;
  this.draftedTeam = draftedTeam;
  this.photoURL = photoURL;
};

//TAKES A SEQUELIZE ROW AND MAKES A NEW PLAYER OBJECT
//TODO add ID
function makePlayers(rowData) {
  var newPlayer = new Player (rowData.name , rowData.teamName , rowData.points , rowData.drafted , rowData.draftedTeam , rowData.photoURL)
  importedPlayerArray.push(newPlayer)
};

//DYNAMICALLY CREATES MUURI CONTAINERS AND POPULATES THEM WITH PLAYER OBJECT INFORMATION
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
    newImg.addClass("playerImg")
    newImageSpan.append(newImg)
  var newTextSpan = $("<span>")
    newSpanTextString = PlayerObject.name
    newTextSpan.append(newSpanTextString)
    newTextSpan.addClass("playerCardText")
  var newBreak = $("<br>")
  var newPointsSpan = $("<span>")
    newPointsSpan.addClass("playerCardText")
    newSpanPointsString = (`Points: ${PlayerObject.points}`)
    newPointsSpan.append(newSpanPointsString)
    newBoardItemContent.append(newImageSpan)
    newBoardItemContent.append(newTextSpan)
    newBoardItemContent.append(newBreak)
    newBoardItemContent.append(newPointsSpan)
    newBoardItem.append(newBoardItemContent)
  $("#chooseTeamBoard").append(newBoardItem)
};

//MUURI CONFIG
var itemContainers = [].slice.call(document.querySelectorAll('.board-column-content'));
var columnGrids = [];
var boardGrid;

//GENERATES MUURI GRIDS FROM DOM INFO
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
};

//INIT NEW MUURI BOARD
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