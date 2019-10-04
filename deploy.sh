#!/bin/bash
git pull origin master
# npm install
echo Compiling TypeScript...
cd src
tsc
cd ..
echo TypeScript compiled

# node_modules/.bin/sequelize db:migrate
# pm2 restart main
node main
