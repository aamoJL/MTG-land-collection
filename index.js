var ownedCards = [];

window.onload = async (e) => {
  await fetchOwnedCards();
  cardFetching("plains");
}

async function fetchOwnedCards() {
  ownedCards = await fetchCards("https://raw.githubusercontent.com/aamoJL/MTG-land-collection/master/owned.json");
}

async function fetchCards(url) {
  return fetch(url)
  .then((res) => res.json())
  .then((json) => {return json});
}

async function cardFetching(name = "plains") {
  var cards;
  var wrapper = document.getElementById("cards");
  wrapper.innerHTML = ""; // Clear contents
  
  json = await fetchCards(`https://api.scryfall.com/cards/search?q=${name}+type%3Abasic+game%3Apaper+unique%3Aarts+order%3Areleased+direction%3Aasc+l%3Aenglish+prefer%3Aoldest`);
  cards = json.data;

  while(json.has_more == true){
    json = await fetchCards(json.next_page);
    cards.push(...json.data);
  }

  const cardCount = cards.length;
  var pageCount = 1;

  for (let i = 0; i < cards.length; i++) {
    
    var page = document.createElement("div");
    page.classList.add("page");
    
    for (let j = 0; j < 9; j++) {
      if(i >= cardCount){break;}
      var card = cards[i];
      var img = document.createElement("img");
      var isOwned = ownedCards.some(e => e.illustration_id === card.illustration_id);
      img.classList.add("card-thumbnail");
      if(isOwned){
        img.classList.add("owned-card");
      }
      else{img.classList.add("unowned");}
      img.addEventListener("click", ((card, event) => {
        if(document.getElementById("edit-mode-check").checked == true){
          var isOwned = ownedCards.some(e => e.illustration_id === card.illustration_id);
          // Edit mode
          if(isOwned){
            removeCard(card);
            event.target.classList.remove("owned");
            event.target.classList.add("unowned");
          }
          else{
            addCard(card);
            event.target.classList.add("owned");
            event.target.classList.remove("unowned");
          }
        }
        else{
          // Select mode
          selectCard(card.illustration_id, card.name, card.artist);
        }
      }).bind(this, card));
      img.src = card.image_uris.normal;
      page.append(img);
      if(j < 8) {i++;}
    };

    var pageCountElement = document.createElement("div");
    pageCountElement.classList.add("pageCount");
    pageCountElement.append(pageCount);

    wrapper.append(pageCountElement);
    wrapper.append(page);
    pageCount++;

    allCards = cards;
  }
}

function changeLands(name) {
  cardFetching(name);
}

async function selectCard(illustrationId, name, artist) {
  artist = artist.replace(" ", "+").replace("&", "%26");
  json = await fetchCards(`https://api.scryfall.com/cards/search?q=${name}+a%3A%22${artist}%22+unique%3Aprints+l%3Aenglish+game%3Apaper`);

  var sameIllustrations = [];

  json.data.forEach(card => {
    if(card.illustration_id === illustrationId){
      sameIllustrations.push(card);
    }
  });

  var wrapper = document.getElementById("card-prints");
  wrapper.innerHTML = ""; // Clear wrapper

  sameIllustrations.forEach(card => {
    var div = document.createElement("div");
    var img = document.createElement("img");
    var p = document.createElement("p");
    p.innerHTML = card.set_name;
    p.classList.add("print-title");
    img.classList.add("card-thumbnail");
    img.src = card.image_uris.normal;
    div.append(img);
    div.append(p);
    wrapper.append(div);
  });
}

function printOwnedJson() {
  var json = JSON.stringify(ownedCards);
  navigator.clipboard.writeText(json);

  console.log(json);
}

function addCard(card) {
  ownedCards.push(card);
}

function removeCard(card) {
  ownedCards = ownedCards.filter(c => c.illustration_id != card.illustration_id);
}