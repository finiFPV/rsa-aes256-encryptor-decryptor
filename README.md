# fini rsa-aes256 encryptor/decryptor

## Description:

Simple program built in nodejs that encrypts/decrypts any size text and  in the future even files using private/public keys. Also a contact library is coming in the future.

## Todo:

### Encryptor:

- Public file selector
- Select person from person contact library
- File compatibility
- Message signing
- Bundle all message related file together in message.zip and save it in user specified location 
- Message being stored message.encrypted file, message data being stored in message.data file and encrypted files being stored as <file name>.<file type like txt>.encrypted

### Decryptor:

- Prompt that asks if the decrypted message should be saved somewhere
- wait for the user too continue not just go back after 5000ms
- File compatibility
- Message sign veification


### Other:

- Function to share pubkey
- Contact library with search. User (name, pubkey, comments)
- UI
