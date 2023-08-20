import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { toHex, hexToBytes } from "ethereum-cryptography/utils.js";

export function trimPrefix(str, prefix) {
	if (str.startsWith(prefix)) {
		return str.slice(prefix.length);
	} else {
		return str;
	}
}

function Wallet({
	address,
	setAddress,
	balance,
	setBalance,
	privateKey,
	setPrivateKey,
}) {
	async function onChange(evt) {
		let privateKey = evt.target.value;
		setPrivateKey(privateKey);

		privateKey = trimPrefix(privateKey, "0x");
		if (privateKey.length !== 64) {
			setAddress("");
			setBalance(0);
			return;
		}

		try {
			const address = `0x${toHex(secp256k1.getPublicKey(privateKey))}`;
			if (address) {
				setAddress(address);
				const {
					data: { balance },
				} = await server.get(`balance/${address}`);
				setBalance(balance);
			} else {
				setBalance(0);
			}
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div className="container wallet">
			<h1>Your Wallet</h1>

			<label>
				Private Key
				<input
					placeholder="Type your private key:"
					value={privateKey}
					onChange={onChange}
				/>
			</label>

			<div className="address">Wallet Address: {address}</div>
			<div className="balance">Balance: {balance}</div>
		</div>
	);
}

export default Wallet;
