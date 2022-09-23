# Setting up a nextjs prject

1. To create: yarn create next-app .
2. To run: yarn run dev
3. Compare `yarn.lock` and `package.json` if you run into error with github repo.

# How to proceed?

1. To connect to metamask wallet we can use different packages of react to do so, One of them being `React Moralis`.

Visit: https://github.com/MoralisWeb3/react-moralis

2. After installing, make sure to wrap your `_app.js` with MoralisProvider like in documentation. It is like a kind of context provider for our react application to use moralis functions.

3. Then importing `useMoralis` from react-moralis where we want to authenticate user. `useMoralis` is a hook and is way to keep track of state in our react application.

4. `useMoralis` functions:

-> `enableWeb3`: To connect to metamask wallet.
-> `isWeb3Enabled`: To keep track if user is connected to metamsk wallet or not.
-> `account`: To keep track if user is connected to an account or not. (Sometimes user is connected to web3 metamask but not connected to any of the account, so it is good practise to check for `account` function instead of `isWeb3Enabled` to make sure we are connected to web3 metamask wallet.)
-> `deactivateWeb3`: This deactivates enableWeb3().
-> `Moralis`: This calls many functions, we have used `Moralis.onAccountChanged((account) => {});`
-> `isWeb3EnableLoading`: Checks if web3 connection to metamask is in progress or not. We can use it in our click event of our connect button in disables property to disable the connect button if isWeb3EnableLoading returns true.

5. Core React Hook: `useEffect()`

-> If we hit refresh and our metamask wallet shows that we are connected but our connect button does not shows shows that we are connected. We have to click on connect button again to see that we are connected. This should work automatically, if we are connected to metamask wallet and our metamask wallet also shows that we are connected then if we refresh our connect button should say that we are connected.

-> When we hit refresh, our website dosen't knows that we hit `enableWeb3` already.

-> Visit: https://reactjs.org/docs/hooks-effect.html

-> Takes 2 param, `useEffect(() => {}, [])` A function and a dependency array and what it will do: it will keep checking the values in the second param i.e. the dependency array and if anything in dependency array changes it is going to call the function in first parameter.

-> 3 cases in `useEffect()`

C1: If there is no dependency array like:

`useEffect(() => {`
`console.log("testing refresh");`
`console.log(isWeb3Enabled);`
`});`

It will run anytime the project re-renders. We need to be careful in setting up this.

C2: If there is empty dependency array like:

`useEffect(() => {`
`console.log("testing refresh");`
`console.log(isWeb3Enabled);`
`}, []);`

It will run only once at the time of refresh.

C3: If there is value in dependency array:

`useEffect(() => {`
`console.log("testing refresh");`
`console.log(isWeb3Enabled);`
`}, [isWeb3Enabled]);`

This will check isWeb3Enabled has been changed or not and if yes it will re-render and call the function.

6. Local Storage in frontend Console > Application > Local Storage

When we setup our `useEffect()` like this:

useEffect(() => {
if (isWeb3Enabled) return;
enableWeb3();
}, [isWeb3Enabled]);

It works properly, if we refresh it shows connected but what if we disconnect from our all accounts from metamask wallet, then it is going to keep asking to connect even if we are not clicking on connect button and it is annoying. Everytime we refresh it is going to ask to connect to metamask wallet.

Here we use our local storage to check that when we clicked this connect button we saved a variable in our browser in local storage and reset this variable when we disconnect from our wallets.

7. `Web3UIkit` is a repo that comes with in built options like building a connect button. You can either use hooks like shown above and in `ManualHeader.js` or you can use `web3uikit` package to import. Visit: https://github.com/web3ui/web3uikit

# What is the use of Hooks in React?

1. Suppose we are using a variable like `let connected = false` to track that are we connected to our metamask wallet or not. After we connect and change the connected to true it won't re-render our view.

Hooks are a way for us to work with states of react and automamtically re-render our view whenever something changes.

# Contract Function calling Next.js using moralis

-> Moralis has all kinds of hooks that lets us to do whatever we want to do and re-renders our view.

-> Calling contract functions can be done via a hook named `useWeb3Contract()`.

Visit: https://github.com/MoralisWeb3/react-moralis#useweb3contract

-> It comes with `isLoading` and `isFetching`. We can use it in buttons to disable when they are loading or fetching transaction.

-> While using `runContractFunction` from `useWeb3Contract` to run contract functions, always remember to use `onSuccess` and `onError` methods while calling them.

```
<button
  onClick={async () => {
    await enterRaffle({
      onError: (error) => console.log(`Raffle enter error: ${error}`),
      onSuccess: () => handleSuccess,
    });
  }}
>
```

-> onSuccess passes `tx` to `handleSuccess`

```
const handleSuccess = async (tx) => {
  tx.wait(1);
}
```

`A special note about onSuccess`

onSuccess does not checks that this transaction has a successfull block confirmation.
It is just checking that the transaction was successfully sent to metamask.
This is why we wait for one block `tx.wait(1);` in `handleSuccess` to see if transaction has gone through.

# Setting abi and contract addresses according to network using backend project for frontend project

1. Create constants folder with abi.json, contractAddresses.json and index.js in frontend project. Initilize these files with curly brackets.

2. Create a deploy script in backend project to save the abi and contract addresses in our frontend project for hardhat network.

3. Run node command in backend project to deploy all scripts on hardhat network and create the values of contract addresses and abi in our frontend project.

# Using useState Hook

Lets suppose:

`let raffleEntranceFee = "";`

```js
useEffect(() => {
  if (isWeb3Enabled) {
    async function updateUI() {
      raffleEntranceFee = await getEntranceFee();
      console.log(raffleEntranceFee);
    }
    updateUI();
  }
}, [isWeb3Enabled]);

return <div>Lottery entrance fee: {raffleEntranceFee}</div>;
```

This will print the `getEntranceFee` in console.log but won't update the view (Lottery entrance fee: will remain empty). Why ?

Because, we are using isWeb3Enabled in dependency array (2nd param) and the first time this runs
when we refresh the isWeb3Enabled will return false but then it will check for isWeb3Enabled and then return true so it will execute console.log statement and update the value of `raffleEntranceFee` as well but it will not re-render the view and thus the raffleEntranceFee value does not gets shown here: `<div>Lottery entrance fee: {raffleEntranceFee}</div>`.

Visit: https://reactjs.org/docs/hooks-state.html

How to use ?

So we can import useState from core react like useEffect

`const [raffleEntranceFee, setRaffleEntranceFee] = useState("0");`

raffleEntranceFee: the variable that will hold the value.
setRaffleEntranceFee: a function that will the value of the variable.
useState("0"): 0 is the default value of raffleEntranceFee.

# Using useNotification hook

Visit: https://web3ui.github.io/web3uikit/?path=/story/5-popup-notification--hook-demo

1. Register in `_app.js` as provider.
2. Use it by importing `useNotification` from `web2uikit`.
3. It gives `dispatch` which we can use to show a message like a popup.

# Tailwind css

Visit: https://tailwindcss.com/docs/guides/nextjs
Install: PostCss Language Support Ext, Tailwind ext

# Hosting on IPFS

1. Visit: https://docs.ipfs.tech/

2. Helps us hosting our decentalized application on a decentralized node/server.

3. our code --> Hash --> IPFS (Our node) --> Our node is connected to massive network of IPFS nodes runnin by people. What other node can do, any node can pin your data so your data persists. You can keep doing this so your code could be pinned by all nodes so it can persits in a decentralized way. We need other nodes to pin our data because if our node goes down that data goes down.

4. To export code to IPFS run:

-> yarn build (Buils production code)
-> yarn next export

Now we have folder named `out`

5. Now visit: https://fleek.co/ (Auto deployment of our code on IPFS)

Signup via github.
