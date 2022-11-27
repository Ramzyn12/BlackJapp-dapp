import React, { useState, Dispatch, SetStateAction } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
const dep: string = "2";
const contractAddress: string = "KT1Vhhu3nE2VYkk6UzekSNTNUi1os8rgDe5w";

interface UpdateContractProps {
  contract: WalletContract | any;
  setUserBalance: Dispatch<SetStateAction<any>>;
  Tezos: TezosToolkit;
  userAddress: string;
  setStorage: Dispatch<SetStateAction<number>>;
  setDepositMade:Dispatch<SetStateAction<boolean>>;
}
const Transfers = ({
  contract = contractAddress,
  setUserBalance,
  Tezos,
  userAddress,
  setStorage,
  setDepositMade
}: UpdateContractProps) => {
  const [recipient, setRecipient] = useState<string>(contractAddress);
  const [amount, setAmount] = useState<string>(dep);
  const [loading, setLoading] = useState<boolean>(false);

  const sendDeposit = async (): Promise<void> => {
    try {
      const contract = await Tezos.wallet.at(contractAddress);
      const op = await contract.methods.default(false).send({amount:2});
      await op.confirmation();
      const newStorage: any = await contract.storage();
      if (newStorage) setStorage(newStorage.toNumber());
      setUserBalance(await Tezos.tz.getBalance(userAddress));
      setDepositMade(true);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  return (
    <div id="transfer-inputs">
      <input
        type="text"
        placeholder="Recipient"
        value={contractAddress}
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
        onClick={sendDeposit}
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
