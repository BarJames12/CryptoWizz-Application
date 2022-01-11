$(function () {
  let IntervalId;

  let coinsArray = [];
  let coinIdToShowMoreInfoMap = new Map();
  let checkedCoinsIdSet = new Set();

  function loadAllCoins() {
    $("#pageLoader").show();
    clearInterval(IntervalId);
    let url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD";
    $.get(url)
      .then((coins) => {
        $("#pageLoader").hide();
        showCoinsOnUi(coins);
        coinsArray = coins;
        console.log(coins);
        loadTogglesFromLocalStorage();
        console.log(selectedCoinsArr);
        console.log(selectedToggleIds);
      })
      .catch((error) => {
        alert(error);
      });
  }
  loadAllCoins();

  function showCoinsOnUi(coins) {
    for (let index = 0; index < coins.length; index++) {
      createCoinCard(coins[index]);
      onShowMoreInfoClick(coins[index].id);
    }
    turnOnSelectedTogglesIds();
  }

  function createCoinCard(coins) {
    let html = ` 
     <div class="col-sm-3"  id="${coins.symbol.toUpperCase()}" >
          <div class="card">
              <div class="card-body">
              <label class="switch">
              <input type="checkbox" class="checkboxes" onchange="toggleFunc(this,'${coins.symbol.toUpperCase()}')" id="check${coins.symbol.toUpperCase()}"> <span class="slider round"></span>
              </label>

                  <h5 id="${coins.symbol.toUpperCase()}a1" class="card-title">${coins.symbol.toUpperCase()}</h5>
                  <p class="card-text">${coins.name}</p>
                  <button class="btn" id="moreInfoBtn${
                    coins.id
                  }"type="button" data-toggle="collapse" data-target="#open${
      coins.id
    }" aria-expanded="false" aria-controls="collapseExample">Show Info >>
                  </button>
                  <div class="collapse" id="open${coins.id}">
                   <div class="card card-body" id="${coins.id}">
                    <div class="d-flex loader justify-content-center">
                    <div class="spinner-border text-info" id="showInfoLoader" role="status"></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>`;
    $("#coinsContainer").append(html);
  }

  // ========== Show Info CallBack =========//
  function onShowMoreInfoClick(coinId) {
    $(`#moreInfoBtn${coinId}`).on("click", function () {
      if (checkedCoinsIdSet.has(coinId)) {
        checkedCoinsIdSet.delete(coinId);
        return;
      }
      getMoreInfo(coinId);
    });
  }

  function getMoreInfo(coinId) {
    let url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    $.get(url).then((coins) => {
      createShowInfoOnUi(coinId, coins);
      checkedCoinsIdSet.add(coinId);

      saveCoinShowInfoInCache(coins, coinId);

      console.log(checkedCoinsIdSet);
      console.log(coinIdToShowMoreInfoMap);
    });
  }

  function saveCoinShowInfoInCache(coins, coinId) {
    let id = coins.id;
    let image = coins.image.small;
    let usd = coins.market_data.current_price.usd;
    let eur = coins.market_data.current_price.eur;
    let ils = coins.market_data.current_price.ils;

    coinInShowInfo = { id, image, usd, eur, ils };
    coinIdToShowMoreInfoMap.set(id, coinInShowInfo);

    setTimeout(() => {
      coinIdToShowMoreInfoMap.delete(coinId);
      getMoreInfo(coinId);
    }, 12000);
  }

  function createShowInfoOnUi(coinId, coins) {
    $(`#${coinId}.card`).html(`
            <div><img src=${coins.image.small}/></div><br>
            <div>$ ${coins.market_data.current_price.usd}</div>
            <div>€ ${coins.market_data.current_price.eur}</div>
            <div>₪ ${coins.market_data.current_price.ils}</div>
            `);
  }
  // ================== Home and logo button CallBack ==================//
  $("#homeBtn , #logoBtn ").on("click", () => {
    homeAndLogoClick();
  });

  function homeAndLogoClick() {
    $("#pageLoader").hide();
    $("#coinsContainer").empty();
    $("#chartContainer").empty();
    $("#aboutContainer").hide();
    $("#searchDiv").show();
    $("#SelectedCoinDiv").show();
    clearInterval(IntervalId);
    let coins = showCoinsOnUi(coinsArray);
    $("#coinsContainer").hide().append(coins).fadeIn("slow");
  }

  // ===================== About click CallBack =========================//
  $("#about").click(() => {
    clearInterval(IntervalId);
    $("#pageLoader").hide();
    $("#searchDiv").hide();
    $("#SelectedCoinDiv").hide();
    $("#chartContainer").empty();
    $("#coinsContainer").empty();
    let aboutMeHtml = $("#aboutContainer");
    $("#aboutContainer").hide().append(aboutMeHtml).fadeIn("slow");
  });

  // ===================== Search button CallBack =======================//

  $("#searchInput").on("keypress", function (e) {
    let key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (!/^[A-Z0-9]+$/i.test(key)) {
      event.preventDefault();
    }
  });

  $("#searchInput").on("keyup", function () {
    clearInterval(IntervalId);
    let search = $("#searchInput").val().toUpperCase();

    $(".col-sm-3").each(function () {
      let card = $(this).attr("id").toUpperCase();
      let symbol = $(this).attr("class").toUpperCase();
      if (card.includes(search) || symbol.includes(search)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  // ==================== Live Report AJAX callback =======================//

  $("#liveReport , #modalGoGraphBtn").on("click", () => {
    clearInterval(IntervalId);
    if (selectedCoinsArr.length < 1) {
      Swal.fire({
        title: "Oops!",
        text: "Please Select at least one coin to enter Live Report",
        icon: "error",
        confirmButtonText: "OK",
      });
    } else {
      $("#aboutContainer").hide();
      $("#coinsContainer").hide();
      $("#searchDiv").hide();
      $("#pageLoader").show();
      let liveCoinNameArr1 = [];
      let liveCoinNameArr2 = [];
      let liveCoinNameArr3 = [];
      let liveCoinNameArr4 = [];
      let liveCoinNameArr5 = [];
      let liveCoinNameArr = [];

      liveCoinNameArr = [];

      function getData() {
        let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoinsArr[0]},${selectedCoinsArr[1]},${selectedCoinsArr[2]},${selectedCoinsArr[3]},${selectedCoinsArr[4]}&tsyms=USD`;

        $.get(url).then((reports) => {
          let dateNow = new Date();
          let counter = 1;

          liveCoinNameArr = [];

          for (let key in reports) {
            if (counter == 1) {
              liveCoinNameArr1.push({ x: dateNow, y: reports[key].USD });
              liveCoinNameArr.push(key);
            }

            if (counter == 2) {
              liveCoinNameArr2.push({ x: dateNow, y: reports[key].USD });
              liveCoinNameArr.push(key);
            }

            if (counter == 3) {
              liveCoinNameArr3.push({ x: dateNow, y: reports[key].USD });
              liveCoinNameArr.push(key);
            }

            if (counter == 4) {
              liveCoinNameArr4.push({ x: dateNow, y: reports[key].USD });
              liveCoinNameArr.push(key);
            }

            if (counter == 5) {
              liveCoinNameArr5.push({ x: dateNow, y: reports[key].USD });
              liveCoinNameArr.push(key);
            }

            counter++;
          }
          $("#pageLoader").hide();
          createGraph();
        });
      }
      IntervalId = setInterval(() => {
        getData();
      }, 2000);

      function createGraph() {
        var options = {
          backgroundColor: "#fdfdfdca",
          exportEnabled: true,
          animationEnabled: false,
          title: {
            fontFamily: "tahoma",
            fontColor: "black",
            text: `${selectedCoinsArr} ${" "} live in USD`,
          },
          subtitles: [
            {
              fontFamily: "tahoma",
              fontColor: "black",
              text: "Hover coin to Hide or Unhide the coins values",
            },
          ],
          axisX: {
            title: "Coins Name",
            valueFormatString: "HH:mm:ss",
            titleFontColor: "black",
            labelFontColor: "black",
            tickColor: "black",
            lineColor: "black",
          },
          axisY: {
            title: "Coin Value",
            suffix: "$",
            titleFontColor: "black",
            lineColor: "black",
            labelFontColor: "black",
            tickColor: "black",
            includeZero: false,
            gridColor: "black",
          },
          axisY2: {
            title: "Profit in USD",
            titleFontColor: "black",
            lineColor: "#C0504E",
            labelFontColor: "#C0504E",
            tickColor: "#C0504E",
          },
          toolTip: {
            shared: true,
          },
          legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries,
          },
          data: [
            {
              type: "spline",
              name: liveCoinNameArr[0],
              nameColor: "black",
              showInLegend: true,
              xValueFormatString: "MMM YYYY",
              dataPoints: liveCoinNameArr1,
              indexLabelLineColor: "black",
            },
            {
              type: "spline",
              name: liveCoinNameArr[1],
              showInLegend: true,
              xValueFormatString: "MMM YYYY",
              dataPoints: liveCoinNameArr2,
            },
            {
              type: "spline",
              name: liveCoinNameArr[2],
              showInLegend: true,
              xValueFormatString: "MMM YYYY",
              dataPoints: liveCoinNameArr3,
            },
            {
              type: "spline",
              name: liveCoinNameArr[3],
              showInLegend: true,
              xValueFormatString: "MMM YYYY",
              dataPoints: liveCoinNameArr4,
            },
            {
              type: "spline",
              name: liveCoinNameArr[4],
              showInLegend: true,
              xValueFormatString: "MMM YYYY",
              dataPoints: liveCoinNameArr5,
            },
          ],
        };
        $("#chartContainer").CanvasJSChart(options);

        function toggleDataSeries(e) {
          if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      }
    }
    // }
  });
}); // End func.

// ======================= Toggle button CallBack =========================//

let selectedCoinsArr = [];
let selectedToggleIds = [];

function toggleFunc(currentToggle, selctedCoin) {
  let toggleId = currentToggle.id;

  let indexCoin = selectedCoinsArr.indexOf(selctedCoin);
  let indexIdToggle = selectedToggleIds.indexOf(toggleId);

  if (indexCoin != -1) {
    selectedCoinsArr.splice(indexCoin, 1);
    updateSelectedCoinsInNav();
    selectedToggleIds.splice(indexIdToggle, 1);
    saveCoinsArraysInLocalStorage();
  } else {
    if (selectedCoinsArr.length < 5) {
      selectedCoinsArr.push(selctedCoin);
      updateSelectedCoinsInNav();
      selectedToggleIds.push(toggleId);
      saveCoinsArraysInLocalStorage();
    } else {
      console.log("too much coins");
      $("#modalBody").empty();
      $(`#${toggleId}`).prop("checked", false);
      showModal(selctedCoin);

      let idCounter = 1;
      for (let i = 0; i < selectedCoinsArr.length; i++) {
        let html = `
        <div class="card" id="modalCard">
        <h6 class="card-title" id="modalCoinName">${selectedCoinsArr[i]}</h6>
        <label class="switch " id="modalSwitch">
        <input type="checkbox" class="checkboxes"  id="chosenToggle${idCounter}"> <span class="slider round" id="modalSlider"></span>
        </label>
        </div>
        `;

        $("#modalBody").append(html);

        $(`#chosenToggle${idCounter}`).prop("checked", true);
        $(`#chosenToggle${idCounter}`).on("change", () => {
          let indexCoinRemove = selectedCoinsArr.indexOf(selectedCoinsArr[i]);

          let toggleTofalse = selectedToggleIds[indexCoinRemove];

          selectedCoinsArr.splice(indexCoinRemove, 1);
          updateSelectedCoinsInNav();
          selectedToggleIds.splice(indexCoinRemove, 1);

          selectedCoinsArr.push(selctedCoin);
          updateSelectedCoinsInNav();
          selectedToggleIds.push(toggleId);

          $(`#${toggleTofalse}`).prop("checked", false);
          hideModal();

          saveCoinsArraysInLocalStorage();
          turnOnSelectedTogglesIds();
        });
        idCounter++;
      }
    }
    console.log(selectedCoinsArr);
    console.log(selectedToggleIds);
  }
  //-------- modal Close Button   ---------///
  $("#modalCloseBtn").on("click", () => {
    $(`#${toggleId}`).prop("checked" == false);
    hideModal();
  });

  //-------- modal clear all toggles   ---------///
  $("#modalClearAllCoinsBtn").click(() => {
    for (let i = 0; i < selectedToggleIds.length; i++) {
      $(`#${selectedToggleIds[i]}`).prop("checked", false);
    }
    selectedCoinsArr = [];
    selectedToggleIds = [];
    $("#selectedCoins").html(" ");
    localStorage.removeItem("selectedCoinsKey");
    localStorage.removeItem("togglesIdKey");
    hideModal();
  });
}

//-------- Turn on all toggles in array --------//
function turnOnSelectedTogglesIds() {
  for (let i = 0; i < selectedToggleIds.length; i++) {
    $(`#${selectedToggleIds[i]}`).prop("checked", true);
  }
}

//----------- Save Coins and toggles on Local Storage -------//
function saveCoinsArraysInLocalStorage() {
  localStorage.setItem("selectedCoinsKey", JSON.stringify(selectedCoinsArr));
  localStorage.setItem("togglesIdKey", JSON.stringify(selectedToggleIds));
}

//-------- Load toggle from local Str and Trun them on --------//
function loadTogglesFromLocalStorage() {
  let selectedCoinsInLocalStr = JSON.parse(localStorage.getItem("selectedCoinsKey"));
  let localStrTogglesIds = JSON.parse(localStorage.getItem("togglesIdKey"));
  if (!selectedCoinsInLocalStr || !localStrTogglesIds) {
    return console.log("No coins array in local Storage!");
  } else {
    selectedCoinsArr = selectedCoinsInLocalStr;
    selectedToggleIds = localStrTogglesIds;
    turnOnSelectedTogglesIds();
    updateSelectedCoinsInNav();
  }
}

//---- Coins in navbar function ----//
function updateSelectedCoinsInNav() {
  let coinsInNav = "";
  for (let i = 0; i < selectedCoinsArr.length; i++) {
    if (i == selectedCoinsArr.length - 1) {
      coinsInNav += selectedCoinsArr[i];
    } else {
      coinsInNav += selectedCoinsArr[i] + ", ";
    }
  }
  $("#selectedCoins").html(coinsInNav);
}

let coinsInSpan = $(".selectedCoins");
$(window).scroll(function () {
  if ($(window).scrollTop() > 100) {
    $("#linksDiv").append(coinsInSpan);
    $(".selectedCoins").css({ background: "none", color: "white", "margin-left": "30px" });
  } else if ($(window).scrollTop() > 20) {
    $("#SelectedCoinDiv").append(coinsInSpan);
    $(coinsInSpan).css({ background: "none", color: "#012a4ec0" });
  }
});

//---- Show/ hide modal function ----//
function showModal(selctedCoin) {
  $("#wantedCoin").empty();
  let html = selctedCoin;
  $("#wantedCoin").append(html);
  $("#myModal").modal();
}

function hideModal() {
  $("#myModal").modal("hide");
}

//---- Back to top Button ----//
let btn = $("#backToTopBtn");

$(window).scroll(function () {
  if ($(window).scrollTop() > 250) {
    btn.addClass("show");
  } else {
    btn.removeClass("show");
  }
});
btn.on("click", function (e) {
  e.preventDefault();
  $("html, body").animate({ scrollTop: 0 }, "100");
});


// SOCIAL SECTION
function linkedin() {
  $("#linkedin").click(() => {
    window.open("https://www.linkedin.com/in/bar-james", "_blank");
  });
}
linkedin();

function gitHub() {
  $("#gitHub").click(() => {
    window.open("https://github.com/BarJames12", "_blank");
  });
}
gitHub();

