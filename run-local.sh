set -a
source .env
set +a

docker run -p 4000:4000 --rm \
  -e SECRET="$SECRET" \
  vote-prover:local