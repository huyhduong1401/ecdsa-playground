const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const { keccak256 } = require("ethereum-cryptography/keccak.js");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils.js");

function trimPrefix(str, prefix) {
	if (str.startsWith(prefix)) {
		return str.slice(prefix.length);
	} else {
		return str;
	}
}

app.use(cors());
app.use(express.json());

const balances = {
	"0x1": 100,
	"0x2": 50,
	"0x3": 75,
	"0x02b767cb38dc384f9875f33bf426587db0c5094e05fa7beb05151152d3d39e8bd5": 100,
};

app.get("/balance/:address", (req, res) => {
	const { address } = req.params;
	const balance = balances[address] || 0;
	res.send({ balance });
});

app.post("/send", (req, res) => {
	const { sender, recipient, amount, signature } = req.body;
	const publicKey = trimPrefix(sender, "0x");

	const isSigned = secp256k1.verify(
		signature,
		keccak256(utf8ToBytes(sender + amount + recipient)),
		publicKey,
	);

	if (!isSigned) {
		return res.status(400).send({ message: "Invalid signature" });
	}

	setInitialBalance(sender);
	setInitialBalance(recipient);

	if (balances[sender] < amount) {
		res.status(400).send({ message: "Not enough funds!" });
	} else {
		balances[sender] -= amount;
		balances[recipient] += amount;
		res.send({ balance: balances[sender] });
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
	if (!balances[address]) {
		balances[address] = 0;
	}
}
