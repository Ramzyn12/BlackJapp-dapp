import React, { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import Status from "./components/Status";
import Controls from "./components/Controls";
import Hand from "./components/Hand";
import jsonData from "./deck.json";
import Transfers from "./components/Transfers";

const App = () => {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit("https://ghostnet.ecadinfra.com")
  );
  const [contract, setContract] = useState<any>(undefined);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [storage, setStorage] = useState<number>(0);
  const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
  const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("transfer");

  const [depositMade, setDepositMade] = useState<boolean>(false);

  const contractAddress: string = "KT1QMGSLynvwwSfGbaiJ8gzWHibTCweCGcu8";

  enum GameState {
    bet,
    init,
    userTurn,
    dealerTurn,
  }

  enum Deal {
    user,
    dealer,
    hidden,
  }

  enum Message {
    bet = "Place a Bet!",
    hitStand = "Hit or Stand?",
    bust = "Bust!",
    userWin = "You Win!",
    dealerWin = "Dealer Wins!",
    tie = "Tie!",
  }

  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [playerWon, setPlayerWon] = useState<boolean>(false);

  const data = JSON.parse(JSON.stringify(jsonData.cards));
  const [deck, setDeck]: any[] = useState(data);

  const [userCards, setUserCards]: any[] = useState([]);
  const [userScore, setUserScore] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const [dealerCards, setDealerCards]: any[] = useState([]);
  const [dealerScore, setDealerScore] = useState(0);
  const [dealerCount, setDealerCount] = useState(0);

  const [balance, setBalance] = useState(100);
  const [bet, setBet] = useState(0);

  const [gameState, setGameState] = useState(GameState.bet);
  const [message, setMessage] = useState(Message.bet);
  const [buttonState, setButtonState] = useState({
    hitDisabled: false,
    standDisabled: false,
    resetDisabled: true,
  });

  useEffect(() => {
    if (gameState === GameState.init) {
      drawCard(Deal.user);
      drawCard(Deal.hidden);
      drawCard(Deal.user);
      drawCard(Deal.dealer);
      setGameState(GameState.userTurn);
      setMessage(Message.hitStand);
    }
  }, [gameState]);

  useEffect(() => {
    calculate(userCards, setUserScore);
    setUserCount(userCount + 1);
  }, [userCards]);

  useEffect(() => {
    calculate(dealerCards, setDealerScore);
    setDealerCount(dealerCount + 1);
  }, [dealerCards]);

  useEffect(() => {
    if (gameState === GameState.userTurn) {
      if (userScore === 21) {
        buttonState.hitDisabled = true;
        setButtonState({ ...buttonState });
      } else if (userScore > 21) {
        bust();
      }
    }
  }, [userCount]);

  useEffect(() => {
    if (gameState === GameState.dealerTurn) {
      if (dealerScore >= 17) {
        checkWin();
      } else {
        drawCard(Deal.dealer);
      }
    }
  }, [dealerCount]);

  const resetGame = () => {
    console.clear();
    setDeck(data);

    setUserCards([]);
    setUserScore(0);
    setUserCount(0);

    setDealerCards([]);
    setDealerScore(0);
    setDealerCount(0);

    setBet(0);

    setGameState(GameState.bet);
    setMessage(Message.bet);
    setButtonState({
      hitDisabled: false,
      standDisabled: false,
      resetDisabled: true,
    });
  };

  const placeBet = (amount: number) => {
    setBet(amount);
    setBalance(Math.round((balance - amount) * 100) / 100);
    setGameState(GameState.init);
  };

  const drawCard = (dealType: Deal) => {
    if (deck.length > 0) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const card = deck[randomIndex];
      deck.splice(randomIndex, 1);
      setDeck([...deck]);
      console.log("Remaining Cards:", deck.length);
      switch (card.suit) {
        case "spades":
          dealCard(dealType, card.value, "♠");
          break;
        case "diamonds":
          dealCard(dealType, card.value, "♦");
          break;
        case "clubs":
          dealCard(dealType, card.value, "♣");
          break;
        case "hearts":
          dealCard(dealType, card.value, "♥");
          break;
        default:
          break;
      }
    } else {
      alert("All cards have been drawn");
    }
  };

  const dealCard = (dealType: Deal, value: string, suit: string) => {
    switch (dealType) {
      case Deal.user:
        userCards.push({ value: value, suit: suit, hidden: false });
        setUserCards([...userCards]);
        break;
      case Deal.dealer:
        dealerCards.push({ value: value, suit: suit, hidden: false });
        setDealerCards([...dealerCards]);
        break;
      case Deal.hidden:
        dealerCards.push({ value: value, suit: suit, hidden: true });
        setDealerCards([...dealerCards]);
        break;
      default:
        break;
    }
  };

  const revealCard = () => {
    dealerCards.filter((card: any) => {
      if (card.hidden === true) {
        card.hidden = false;
      }
      return card;
    });
    setDealerCards([...dealerCards]);
  };

  const calculate = (cards: any[], setScore: any) => {
    let total = 0;
    cards.forEach((card: any) => {
      if (card.hidden === false && card.value !== "A") {
        switch (card.value) {
          case "K":
            total += 10;
            break;
          case "Q":
            total += 10;
            break;
          case "J":
            total += 10;
            break;
          default:
            total += Number(card.value);
            break;
        }
      }
    });
    const aces = cards.filter((card: any) => {
      return card.value === "A";
    });
    aces.forEach((card: any) => {
      if (card.hidden === false) {
        if (total + 11 > 21) {
          total += 1;
        } else if (total + 11 === 21) {
          if (aces.length > 1) {
            total += 1;
          } else {
            total += 11;
          }
        } else {
          total += 11;
        }
      }
    });
    setScore(total);
  };

  const hit = () => {
    drawCard(Deal.user);
  };

  const stand = () => {
    buttonState.hitDisabled = true;
    buttonState.standDisabled = true;
    buttonState.resetDisabled = false;
    setButtonState({ ...buttonState });
    setGameState(GameState.dealerTurn);
    revealCard();
  };

  const bust = () => {
    buttonState.hitDisabled = true;
    buttonState.standDisabled = true;
    buttonState.resetDisabled = false;
    setButtonState({ ...buttonState });
    setMessage(Message.bust);
    setGameFinished(true);
  };

  const checkWin = () => {
    if (userScore > dealerScore || dealerScore > 21) {
      setBalance(Math.round((balance + bet * 2) * 100) / 100);
      setMessage(Message.userWin);
      setPlayerWon(true);
      setGameFinished(true);
    } else if (dealerScore > userScore) {
      setMessage(Message.dealerWin);
      setGameFinished(true);
    } else {
      setBalance(Math.round((balance + bet * 1) * 100) / 100);
      setMessage(Message.tie);
      setGameFinished(true);
    }
  };

  if (!publicToken && !userAddress && !userBalance) {
    return (
    <div className="main-body">
      <div className="main-box">
        <div className="title">
          <h1>
            WELCOME TO <br></br>
            <span className="coloured">CHANCUEX</span>
            
          </h1>
        </div>
        <div className="description">
          The World's Best Decentralised <span className="blackjack">Blackjack</span> Game - The <span className="blackjack">Safe</span> Way to Gamble
        </div>
        <div id="dialog">
          {/* <header>PLEASE CONNECT YOUR WALLET TO CONTINUE</header> */}

          <ConnectButton
            Tezos={Tezos}
            setContract={setContract}
            setPublicToken={setPublicToken}
            setWallet={setWallet}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setStorage={setStorage}
            contractAddress={contractAddress}
            setBeaconConnection={setBeaconConnection}
            wallet={wallet}
          />
        </div>
      </div>
    </div>
    );
  } else if (userAddress && !isNaN(userBalance) && !depositMade) {
    return (
      <div className="second-page-main">
        <h1 className="coloured red">CHANCUEX</h1>
        <div className="message-container">
        <div className="gamble-message">GREAT! YOUR ALL CONNECTED</div>
        <div className="gamble-message1">DEPOSIT THE STAKE YOU WISH TO PLACE INTO THE 
          TEZOS BLOCKCHAIN AND TRY YOUR "CHANCUEX" TO DOUBLE YOUR TEZ!
        </div>
        </div>
        <Transfers
          Tezos={Tezos}
          setUserBalance={setUserBalance}
          userAddress={userAddress}
          setDepositMade={setDepositMade}
        />
        <DisconnectButton
          wallet={wallet}
          setPublicToken={setPublicToken}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
          setWallet={setWallet}
          setTezos={setTezos}
          setBeaconConnection={setBeaconConnection}
        />
      </div>
    );
  } else if (
    userAddress &&
    !isNaN(userBalance) &&
    depositMade &&
    gameFinished
  ) {
    return (
      <div className="fourth-page-main">
        {/* <h1 className="buttons"> {String(playerWon)}</h1> */}
        <h1 className="buttons">{playerWon ? "YOU WIN" : "YOU LOSE"}</h1>
        <h2>PRESS DISCONNECT TO START AGAIN</h2>
        <DisconnectButton
          wallet={wallet}
          setPublicToken={setPublicToken}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
          setWallet={setWallet}
          setTezos={setTezos}
          setBeaconConnection={setBeaconConnection}
        />
      </div>
    );
  } else if (userAddress && !isNaN(userBalance) && depositMade) {
    return (
      <div className="third-page-main">
        <Status message={message} balance={userBalance / 1000000} />
        <Controls
          balance={balance}
          gameState={gameState}
          buttonState={buttonState}
          betEvent={placeBet}
          hitEvent={hit}
          standEvent={stand}
          resetEvent={resetGame}
        />

        <Hand title={`Dealer's Hand (${dealerScore})`} cards={dealerCards} />
        <Hand title={`Your Hand (${userScore})`} cards={userCards} />
        <div> </div>
        <div className="centerer">
        <DisconnectButton
          wallet={wallet}
          setPublicToken={setPublicToken}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
          setWallet={setWallet}
          setTezos={setTezos}
          setBeaconConnection={setBeaconConnection}
        />
        </div>
      </div>
    );
  }
};

export default App;
