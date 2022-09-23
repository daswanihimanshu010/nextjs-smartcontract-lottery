import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function ManualHeader() {
  // useMoralis is a hook so we can re-render our views automatically if user connects the metasmask
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading, // to check if it is loading or already started connecting
  } = useMoralis();

  // When we reload
  // This will be running all the time to check if isWebEnabled has changed its value
  // then perform the function
  useEffect(() => {
    // If web3 is already enabled no need to call anything just return and exit
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      // if local storage shows that connect button is already clicked
      if (window.localStorage.getItem("connected")) {
        // if web3 is not enabled we have to enable web3
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  // This is to check if we have changed accounts or remove all accounts / disconnected
  // We are initilizing an empty dependency array because we want to run this when we re-render the view

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to: ${account}`);
      // If user disconnects from all his accounts and account is null
      // We are handling what if user wants to disconnect totally
      if (account == null) {
        console.log("Account is null.");
        window.localStorage.removeItem("connected");
        deactivateWeb3(); // This will set enableWeb3 to false
      }
    });
  }, []);

  // We can add javascript in between html by using {} like we are doing below in onClick of button
  return (
    <div>
      {account ? (
        <div>
          Connected to: {account.slice(0, 6)}...
          {account.slice(account.length - 4)}
        </div>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3();
            // setting a new key value to check that we clicked on connect button
            // and connect to metamask
            if (typeof window != "undefined") {
              window.localStorage.setItem("connected", "injected");
            }
          }}
          disabled={isWeb3EnableLoading}
        >
          Connect
        </button>
      )}
    </div>
  );
}
