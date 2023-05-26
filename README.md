# Cardchecker - Client
This project is part from the Cardchecker services ( a Eletronic Point Control System ). So you'll need the others microservices to work.
Here's the other microservices:
* [Cardchecker-api](https://github.com/GSaiki26/cardchecker-api)
* [Cardchecker-client](https://github.com/GSaiki26/cardchecker-client)
* [worker-api](https://github.com/GSaiki26/worker-api)

The cardchecker-client is the client-side project to be used in a pair with the `Cardchecker API`. It's responsible to sending the checks to the api. 

## Deploy
### Certificates
This "microservice" uses a SSL auth. So, create/get a CA certificate and sign the client cert. Here's a command to it:
```ssh
# Create the certs folder and set the cert's subj.
mkdir certs; cd certs;
CA_SUBJ="/CN=ca"
CLIENT_SUBJ="/CN=cardchecker-client"

# Create and sign the certificates.
openssl req -x509 -nodes -days 365 -out ./ca.pem -newkey rsa:2048 -keyout ./ca.pem.key -subj "$CA_SUBJ"

openssl req -new -nodes -out ./client.csr -newkey rsa:2048 -keyout ./client.pem.key -subj "$CLIENT_SUBJ"
openssl x509 -req -days -in ./client.csr -out ./client.pem -CA ./ca.pem -CAkey ./ca.pem.key
```

### Environment variables
All the environment variables can be found in the file `client.env.example`. Here's a briefing:
* "LANG" - The selected language to use in the project. All languages can be found in `./src/langs`;
* "LASTCHECK_RANGE_DAYS" - The range in days to get the last check;
* "LOGGER_LEVEL" - The level of the log;
* "MINUTES_BETWEEN_CHECKS" - The interval of time in minutes to a cardId can be used again;
* "SERVER_URI" - The `cardchecker-api` address. Remember: The same address need to be specified in the certificate.

### Running
You can use Docker to run the project. Here's an example:
```sh
docker build -t cardchecker-client .;
docker run -ti --network SAME_NETWORK_AS_CARDCHECKER_API --env-file ./client.env --volume ${pwd}/data:/app/data:rw --name cardchecker-client cardchecker-client;
```
