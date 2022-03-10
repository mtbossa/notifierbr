Start prod server: pm2 start dist/index.js --name NotifierBr --exp-backoff-restart-delay=100 --watch  --node-args="-r dotenv/config"

pm2 start NotifierBr --exp-backoff-restart-delay=100 --watch 
