const cards = [];
const nipes = ['copas', 'espadas', 'ouros', 'paus'];
const val = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

nipes.forEach((nipe) => {
  val.forEach((value) => {
    cards.push({ nipe, value });
  });
});

const shuffleCards = (arr) => {
  const copyArr = JSON.parse(JSON.stringify(arr)); // deep copy
  const len = copyArr.length;
  for (let i = 0; i < len; i += 1) {
    const index = Math.floor(Math.random() * len);
    [copyArr[i], copyArr[index]] = [copyArr[index], copyArr[i]]; // swith elements
  }
  return copyArr;
};

const generateDeck = ({ nPlayers = 1, nCards }) => {
  const finalHands = [];
  const myDeck = shuffleCards(cards);
  const num = nCards || Math.floor(myDeck.length / nPlayers);
  for (let i = 0; i < nPlayers; i += 1) {
    finalHands.push(myDeck.splice(0, num)); // [ [splice], [splice], ...nPlayers]
  }
  return { playersCards: finalHands, otherCards: myDeck };
};

module.exports = generateDeck;
