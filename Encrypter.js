const {
    existsSync,
    open,
    mkdirSync,
    writeFileSync,
    readFileSync
} = require("fs")
const {
    randomBytes,
    createCipheriv,
    publicEncrypt,
    privateDecrypt,
    createDecipheriv
} = require("crypto")
const prompt = require("prompt-sync")()


const messageFile = "./message.json"
const keyFolder = "./keys/"
const requiredKeyItems = [{
    "name": keyFolder,
    "type": "folder"
}, {
    "name": keyFolder + "rsaPublic.key",
    "type": "keyfile",
    "keyType": "public"
}, {
    "name": keyFolder + "rsaPrivate.key",
    "type": "keyfile",
    "keyType": "private"
}]
let missingKeyItems = []
const input = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
})


const generateKeys = (callback) => {
    const {
        generateKeyPair
    } = require("crypto")
    generateKeyPair("rsa", {
        modulusLength: 1024,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem"
        }
    }, (err, publicKey, privateKey) => {
        if (err) {
            throw err
        } else {
            callback(publicKey, privateKey)
        }
    })
}

const encrypt = async () => {
    return new Promise((resolve, reject) => {
        input.question("Enter the message > ", async message => {
            const key = randomBytes(32)
            const iv = randomBytes(16)
            const cipher = createCipheriv("aes-256-cbc", key, iv)
            let encrypted = cipher.update(message, "utf8", "hex")
            encrypted += cipher.final("hex")
            if (!existsSync(messageFile)) {open(messageFile, "w", (err, stream) => {if (err) throw err})}
            const targetPubKey = readFileSync(keyFolder + 'rsaPublic.key', "utf8")
            const encryptedKey = publicEncrypt(targetPubKey, key)
            const encryptedIV = publicEncrypt(targetPubKey, iv)
            writeFileSync(messageFile, `{"key": "${encryptedKey.toString("hex")}", "iv": "${encryptedIV.toString("hex")}", "message": "${encrypted}"}`)
            console.clear()
            console.log("Verifying message...")
            messageVerify = await decrypt(true)
            console.clear()
            if (messageVerify) {
                console.log("\x1b[32m" + "Encrypted message successfully saved to message.json!"+ "\x1b[0m")
            } else if (messageVerify == false) {
                console.log("\x1b[31m" + "An error occoured with creating a message file! Please try again later." + "\x1b[0m")
            } else if (messageVerify != message) {
                console.log("\x1b[31m" + "An error occoured with verifying encrypted message! Please try again later." + "\x1b[0m")
            } else {
                console.log("\x1b[31m" + "An unknown error occoured! Please try again later." + "\x1b[0m")
            }
            setTimeout(() => {
                console.clear()
                resolve()
            }, 5000)
        })
    })
}

const decrypt = async (quiet = false) => {
    return new Promise((resolve, reject) => {
        if (!existsSync(messageFile)) {
            if (!quiet) {
                console.log("Message file does not exist!")
                return
            } else {
                return false
            }
        }
        const targetPrivKey = readFileSync(keyFolder + 'rsaPrivate.key', "utf8")
        const messageData = JSON.parse(readFileSync(messageFile, "utf8"))
        const decryptedKey = privateDecrypt(targetPrivKey, Buffer.from(messageData["key"], "hex"))
        const decryptedIV = privateDecrypt(targetPrivKey, Buffer.from(messageData["iv"], "hex"))
        const decipher = createDecipheriv("aes-256-cbc", decryptedKey, decryptedIV)
        let decrypted = decipher.update(messageData["message"], "hex", "utf8")
        decrypted += decipher.final("utf8")
        if (quiet) {
            setTimeout(() => {
                resolve(decrypted)
            }, 1000)
        } else {
            console.log(`Decrypted message: ${decrypted}`)
            setTimeout(() => {
                console.clear()
                resolve()
            }, 5000)
        }
    })
}


requiredKeyItems.forEach((item) => {
    if (!existsSync(item["name"])) missingKeyItems.push(item)
})

missingKeyItems.forEach((item) => {
    if (item["type"] === "folder") {
        mkdirSync(item["name"])
    } else if (item["type"].endsWith("file")) {
        open(item["name"], "w", (err, stream) => {
            if (err) throw err
        })
    }
})

if (missingKeyItems.length > 0) {
    generateKeys((publicKey, privateKey) => {
        const keys = {
            "public": publicKey,
            "private": privateKey
        }
        requiredKeyItems.forEach((item) => {
            if (item["type"] === "keyfile") {
                writeFileSync(item["name"], keys[item["keyType"]])
            }
        })
    })
}

(async () => {
    console.clear()
    while (true) {
        console.log("Please choose an option:")
        console.log("1) Encrypt message")
        console.log("2) Decrypt message")
        console.log("3) Quit")

        const choice = prompt("Enter your choice > ")

        switch(choice) {
            case "1":
                console.clear()
                await encrypt()
                break
            case "2":
                console.clear()
                await decrypt()
                break
            case "3":
                process.exit()
            default:
                console.clear()
                console.log("\x1b[31m" + "Invalid choice! Please enter a valid choice.\n" + "\x1b[0m")
        }
    }
})()