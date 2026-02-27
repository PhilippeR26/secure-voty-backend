# SECURE-VOTY Backend

> [!IMPORTANT]
> This repo is the backend of the SECURE-VOTY [project](https://github.com/PhilippeR26/secure-voty), using the Starknet proving features.


## Local test

Docker has to be installed & running on your PC.

### Build & run the backend:
Create a .env file to define a SECRET env constant.

Build:
```bash
docker build -t vote-prover:local .
```

```bash
docker run -p 4000:4000 --rm vote-prover:local
```
> [!TIP]
> For more details see [here](./docker-local-build.md)

### Request to the backend

In an other console:
```bash
curl -X POST http://localhost:4000/prove -H "Content-Type: application/json" -H "X-API-Key: <SECRET>" -d '{"params": ["0x29de50c968dea48d1b1573e5e35593e94d80614c46d63d3602e3961d42acaff","0x01","0x26af69bd5611932e22c77d37b159741013cca4cd22613b284741d3ad6b1b196","0x01","0x46834de20fe71e56d6cda4502646f55e85e3ec51057913e5774c69bbe184483","0x01","0x02","0x6470e032be23949b12cc95a0afac6d016869a5a9e351d461500c7d4d9e8b872","0x61ed79f3eda9549dedad333037a5961d8221a6694aaac6ce3eb7062a5760e40","0x123"]}'
```

> [!WARNING]
> Take care to have a least 15 Gb of free RAM
