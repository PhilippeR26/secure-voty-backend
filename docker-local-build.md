## build
```bash
docker build -t vote-prover:local .
```

## run
```bash
docker run -p 4000:4000 --rm vote-prover:local
```
> [!TIP]
> 3 times <kbd>Ctrl</kbd> + <kbd>C</kbd> to stop



## Varied
### Pb sudo 
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### What is running?
```bash
docker ps
```

### Stop a container
```bash
docker stop <idxx>
```

### Solve port problems
```bash
ss -tuln | grep 4000  # verify if port is free
sudo fuser -k 4000/tcp # kill process and release port
```

### What is available?
```bash
docker image ls
# or
docker images
```

### Remove an image
```bash 
docker rmi <imageName>
```
### Open a terminal in the docker
```bash
docker run -it --rm vote-prover:local bash
```
> [!TIP]
> <kbd>Ctrl</kbd> + <kbd>D</kbd> to stop

