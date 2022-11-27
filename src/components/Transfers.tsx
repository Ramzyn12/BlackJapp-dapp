import React, { useState, Dispatch, SetStateAction } from "react";
import { TezosToolkit } from "@taquito/taquito";

const dep: string = "2";

const Transfers = ({
  Tezos,
  setUserBalance,
  userAddress,
  setDepositMade,
}: {
  Tezos: TezosToolkit;
  setUserBalance: Dispatch<SetStateAction<number>>;
  userAddress: string;
  setDepositMade: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>(dep);
  const [loading, setLoading] = useState<boolean>(false);

  const sendTransfer = async (): Promise<void> => {
    const balance = await Tezos.tz.getBalance(userAddress);
    if (balance.toNumber() > parseInt(dep)) {
      if (recipient && amount) {
        setLoading(true);
        try {
          const op = await Tezos.wallet
            .transfer({ to: recipient, amount: parseInt(dep) })
            .send();
          await op.confirmation();
          setRecipient("");
          setAmount("");
          const balance = await Tezos.tz.getBalance(userAddress);
          setUserBalance(balance.toNumber());
          setDepositMade(true);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div id="transfer-inputs">
      <input
        type="text"
        placeholder="Recipient"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="cost:2"
        value={amount}
        onChange={(e) => setAmount(dep)}
      />
      <button
        className="button"
        disabled={!recipient && !amount}
        onClick={sendTransfer}
      >
        {loading ? (
          <span>
            <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
          </span>
        ) : (
          <span>
            <i className="far fa-paper-plane"></i>&nbsp; Send
          </span>
        )}
      </button>
    </div>
  );
};

export default Transfers;
