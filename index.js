var ownedCards = [];

window.onload = (e) => {

  ownedCards = fetchOwnedCards();
  printOwnedJson();

  cardFetching("plains");
}

async function fetchOwnedCards() {
  return fetch("owned.json").then((res) => res.json()).then((json) => {return json});
}

async function fetchCards(url) {
  return fetch(url)
  .then((res) => res.json())
  .then((json) => {return json});
}

async function fetchCardsPost(url, params){
  const res = await fetch(url, params);
  return res.json();
}

async function cardFetching(name = "plains") {
  var cards;
  var wrapper = document.getElementById("cards");
  wrapper.innerHTML = ""; // Clear contents
  
  json = await fetchCards(`https://api.scryfall.com/cards/search?q=${name}+type%3Abasic+game%3Apaper+unique%3Aarts+order%3Areleased+direction%3Aasc+l%3Aenglish+prefer%3Aoldest`);
  cards = json.data;
  console.log(json);

  while(json.has_more == true){
    json = await fetchCards(json.next_page);
    console.log(json);
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
      img.classList.add("card-thumbnail");
      img.addEventListener("click", selectCard.bind(this, card.illustration_id, card.name, card.artist));
      img.addEventListener("click", addToOwned.bind(this, card));
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
  console.log(json);

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

  console.log(json);
}

function addToOwned(card) {
  ownedCards.push(card);
}