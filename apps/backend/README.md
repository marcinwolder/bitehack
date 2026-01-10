How to start backend

Go into backend folder
```
cd backend
```

Install dependencies
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp test_env .env
```

Start postgis database
```
docker compose -f ../../infra/docker-compose.yaml --env-file test_env up
```

Run app
```
python3 app.main
```