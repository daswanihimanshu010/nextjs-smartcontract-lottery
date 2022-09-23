import { abi, contractAddresses } from "../constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

// first thing we need to do is to enter the raffle

export default function LotteryEntrance() {
  const dispatch = useNotification();

  //const { chainId } = useMoralis();
  // This gives hex code of our chainId like 0x5
  //console.log(chainId);
  // So we do
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis(); // Pull out the chainId object & rename to chainIdHex
  const chainId = parseInt(chainIdHex); // This gives value like 31337

  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  // Using use State hook which is same like:
  // let raffleEntranceFee = "";
  const [raffleEntranceFee, setRaffleEntranceFee] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");
  const [numPlayers, setNumPlayers] = useState("0");
  const [recentWinnner, setRecentWinner] = useState("0");

  // Calling a contract method enterRaffle
  //runContractFunction can send both transactions and functions

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: raffleEntranceFee,
  });

  // To get entranceFee we need to call getter getEntranceFee() from our smart contract
  // How can we do that ?
  // We can call a hook useEffect() as it loads when page is refreshed or this lottery is initilized
  // We are checking for isWeb3Enabled because we need to check that are we connected to metamask
  // to get the entranceFee or not

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getContractBalance } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getContractBalance",
    params: {},
  });

  const { runContractFunction: getNoOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNoOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUI() {
    // Updating entrance fee to enter in raffle and in frontend

    const entranceFeeFromContract = await getEntranceFee({
      onError: (error) => console.log(`Entrance fee error: ${error}`),
    });

    // Because it was giving ETH not entered enough error so we multipled the entrance fee by 2
    setRaffleEntranceFee(entranceFeeFromContract.mul(2).toString());

    // Updating contract balance on frontend

    const contractBalanceCall = await getContractBalance({
      onError: (error) => console.log(`Contract balance error: ${error}`),
    });

    console.log(`Contract updated balance: ${contractBalanceCall.toString()}`);

    setContractBalance(contractBalanceCall.toString());

    // Updating no of players in frontend

    const numOfPlayersCall = await getNoOfPlayers({
      onError: (error) => console.log(`No of players error: ${error}`),
    });

    setNumPlayers(numOfPlayersCall.toString());

    // Updating recent winner

    const recentWinnerCall = await getRecentWinner({
      onError: (error) => console.log(`Recent winner error: ${error}`),
    });

    setRecentWinner(recentWinnerCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  // Because, we are using isWeb3Enabled in dependency array (2nd param) and the first time this runs
  // when we refresh the isWeb3Enabled will return false but then it will check for isWeb3Enabled
  // and then return true.

  // This is why also we are using raffleEntranceFee as setState variable because the 2nd time it will
  // update the value of raffleEntranceFee but won't re-render the view.

  const handleSuccess = async (tx) => {
    console.log("Successful transaction!!");

    // Waiting for transaction to go through
    tx.wait(1);

    console.log(`isWeb3enabled: ${isWeb3Enabled}`);

    // Update UI
    updateUI();

    // Display notification
    handleNotification();
  };

  const handleNotification = function () {
    // can be viewed from web3uikit documentation
    dispatch({
      type: "info",
      message: "Transaction complete!!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div>
      {raffleAddress ? (
        <div className="p-5">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async () => {
              await enterRaffle({
                onError: (error) => console.log(`Raffle enter error: ${error}`),
                onSuccess: handleSuccess,
              });
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <br />
          <br />
          Lottery entrance fee:{" "}
          {ethers.utils.formatUnits(raffleEntranceFee, "ether")} ETH
          <br />
          Lottery Collection:{" "}
          {ethers.utils.formatUnits(contractBalance, "ether")} ETH
          <br />
          Recent Winner: {recentWinnner}
          <br />
          Num of Players: {numPlayers}
        </div>
      ) : (
        <div>
          No raffle address found. Please check which network you are on.
        </div>
      )}
    </div>
  );
}
